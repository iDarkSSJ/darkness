import { createApp } from './src/app.js'
import { gSessionTempId } from './src/models/supabase/gSessionTempId.js'
import { SessionModel } from './src/models/supabase/sessions.js'
import { ShellModel } from './src/models/supabase/shellModel.js'
import { StateModel } from './src/models/supabase/stateModel.js'
import { UserModel } from './src/models/supabase/user.js'

createApp({
  userModel: UserModel,
  googleIdModel: gSessionTempId,
  sessionModel: SessionModel,
  shellModel: ShellModel,
  stateModel: StateModel,
})
