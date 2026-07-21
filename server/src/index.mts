import 'dotenv/config'
import { createApp } from './server.mts'
import { config } from './config.mts'

const { httpServer } = await createApp()
httpServer.listen(config.port, () => {
  console.log(`kalak backend listening on port ${config.port}`)
})
