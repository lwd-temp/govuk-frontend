import generateStatsMessage from './generate-stats-message.js'

// Not really a test but a way to run generateMessage again and again
describe.skip('generateStatsMessage', () => {
  it('Generates a message', () => {
    console.log(generateStatsMessage())
  })
})