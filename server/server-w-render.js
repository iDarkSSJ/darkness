import { createApp } from './src/app.js'
import { gSessionTempId } from './src/models/postgreRender/gSessionTempId.js'
import { SessionModel } from './src/models/postgreRender/sessions.js'
import { ShellModel } from './src/models/postgreRender/shellModel.js'
import { StateModel } from './src/models/postgreRender/stateModel.js'
import { UserModel } from './src/models/postgreRender/user.js'

createApp({
  userModel: UserModel,
  googleIdModel: gSessionTempId,
  sessionModel: SessionModel,
  shellModel: ShellModel,
  stateModel: StateModel,
})
