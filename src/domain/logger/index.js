import winston from 'winston'
import { Logtail } from '@logtail/node'
import { LogtailTransport } from '@logtail/winston'
import config from '#src/config'

const logtail = new Logtail(config.LOGTAIL.TOKEN)

const logger = config.IS_LOCAL
  ? console
  : winston.createLogger({
      level: 'http',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console(),
        new LogtailTransport(logtail),
      ],
    })

export default logger
