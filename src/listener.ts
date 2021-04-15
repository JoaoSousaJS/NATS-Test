import nats from 'node-nats-streaming'

const stan = nats.connect('ticketing', '123', {
  url: 'http://localhost:4222'
})

stan.on('connect', () => {
  console.log('listener connected to NATS')
})