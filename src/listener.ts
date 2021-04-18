import nats, { Message, Stan } from 'node-nats-streaming'
import { randomBytes} from 'crypto'

console.clear()

const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222'
})

stan.on('connect', () => {
  console.log('listener connected to NATS')

  stan.on('close', () => {
    console.log('NATS connection closed!')
    process.exit()
  })

  const options = stan.subscriptionOptions()
  .setManualAckMode(true).setDeliverAllAvailable().setDurableName('ordersServiceQueueGroup')

  const subscription = stan.subscribe('ticket:created','queue-group-name', options)

  subscription.on('message', (msg: Message) => {
    console.log(msg.getData())

    const data = msg.getData()

    if (typeof data === 'string') {
      console.log(`Received event #${msg.getSequence()}, with data: ${data}`)
    }

    msg.ack()

  })
})

process.on('SIGINT', () => stan.close())
process.on('SIGTERM', () => stan.close())

abstract class Listener {
  abstract subject: string
  abstract queueGroupName: string
  abstract onMessage(data: any, msg: Message):void
  private client: Stan
  protected ackWait = 5 * 100

  constructor(client: Stan) {
    this.client = client
  }

  subscriptionOptions() {
    return this.client.subscriptionOptions()
    .setDeliverAllAvailable()
    .setManualAckMode(true)
    .setAckWait(this.ackWait)
    .setDurableName(this.queueGroupName)
  }

  listen() {
    const subscritption = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions()
    )

    subscritption.on('message', (msg: Message) => {
      console.log(
        `Message received: ${this.subject} / ${this.queueGroupName}`
      )

      const parseData = this.parseMessage(msg)

      this.onMessage(parseData, msg)
    })
  }

  parseMessage(msg: Message) {
    const data = msg.getData()
    return typeof data === 'string'
      ? JSON.parse(data) : JSON.parse(data.toString('utf-8'))
  }
}