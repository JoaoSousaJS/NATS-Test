import nats, { Message } from 'node-nats-streaming'
import { randomBytes} from 'crypto'

console.clear()

const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222'
})

stan.on('connect', () => {
  console.log('listener connected to NATS')

  const subscription = stan.subscribe('ticket:created', 'ordersServiceQueueGroup')

  subscription.on('message', (msg: Message) => {
    console.log(msg.getData())

    console.log('Message Received')
  })
})