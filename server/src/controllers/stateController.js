import { deleteRawFromCloud, uploadToCloud } from '../config/cloudinaryConfig.js'
import { StateModel } from '../models/postgreRender/stateModel.js'
import { uploadStateToCloud } from '../utils/utils.js'

export class StateController {
  static async getStatesByShell(req, res) {
    const { shell_id } = req.params
    const { user_id } = req.user

    if (!shell_id || !user_id) return res.status(400).send('Missing shell or user id')

    try {
      const states = await StateModel.getStatesById({ shell_id, user_id })
      if (states.error) {
        return res.status(500).send('Failed to get states')
      }
      return res.json(states.states)
    } catch (err) {
      console.error(err)
      res.status(500).send('Failed to get states')
    }
  }

  static async createState(req, res) {
    try {
      const { shell_id } = req.params
      const { slot_number } = req.body
      const { user_id } = req.user
      const stateFile = req.file

      if (!shell_id || !stateFile || !slot_number) {
        return res.status(400).send('Missing shell, state file, or slot number.')
      }
      const stateBuffer = stateFile.buffer

      const stateExists = await StateModel.getStateBySlot({ shell_id, slot_number, user_id })
      if (stateExists.error) {
        console.error('Error fetching state')
        return res.status(500).send('Failed to fetch state.')
      }

      if (stateExists.state) {
        await deleteRawFromCloud(stateExists.state.state_public_id)
        const newStateReq = await uploadStateToCloud(stateBuffer)

        const newState = {
          slot_number,
          ...newStateReq,
        }

        const updatedState = await StateModel.updateState({
          shell_id,
          state_id: stateExists.state.state_id,
          state: newState,
        })
        if (updatedState.error) {
          await deleteRawFromCloud(newStateReq.state_public_id)
          return res.status(500).send('Failed to update state.')
        }

        return res.json(updatedState.state)
      } else {
        const stateData = await uploadStateToCloud(stateBuffer)

        const stateSchema = {
          slot_number,
          ...stateData,
        }

        const newState = await StateModel.createState({ shell_id, state: stateSchema })

        if (newState.error) {
          await deleteRawFromCloud(stateData.state_public_id)
          return res.status(500).send('Failed to create state.')
        }

        return res.json(newState.state)
      }
    } catch (err) {
      console.error('Error creating state:', err)
      return res.status(500).send('Failed to create state.')
    }
  }

  static async deleteState(req, res) {
    const { shell_id, state_id } = req.params
    const { user_id } = req.user
    if (!shell_id || !state_id) return res.status(400).send('Missing shell or user id')

    try {
      const stateFound = await StateModel.getStateById({ shell_id, state_id, user_id })
      if (stateFound.error) {
        return res.status(500).send('Failed to fetch state')
      }

      const { state_public_id } = stateFound.state
      await deleteRawFromCloud(state_public_id)
      const deleteState = await StateModel.deleteState({ shell_id, state_id, user_id })
      if (deleteState.error) {
        return res.status(500).send('Failed to delete state')
      }
      return res.status(200).send('State deleted successfully.')
    } catch (err) {
      console.error(err)
      return res.status(500).send('Failed to delete state')
    }
  }

  static async updateState(req, res) {
    const { shell_id, state_id } = req.params
    const { user_id } = req.user
    const { state, slot_number } = req.body
    if (!shell_id || !state_id || !state) return res.status(400).send('Missing shell or state')

    try {
      const stateFound = await StateModel.getStateById({ shell_id, state_id, user_id })
      if (stateFound.error) {
        return res.status(500).send('Failed to fetch state')
      }

      const { state_public_id } = stateFound.state
      await deleteRawFromCloud(state_public_id)

      const updatedStateBuffer = Buffer.from(state)
      const updatedStateUploadResult = await uploadToCloud(updatedStateBuffer, 'states', 'raw')
      const updatedStateSchema = {
        slot_number,
        state_public_id: updatedStateUploadResult.public_id,
        state_url: updatedStateUploadResult.secure_url,
      }
      const updatedState = await StateModel.updateState({
        shell_id,
        state_id,
        updatedState: updatedStateSchema,
      })
      if (updatedState.error) {
        await deleteRawFromCloud(updatedStateUploadResult.public_id)
        return res.status(500).send('Failed to update state')
      }
      return res.status(200).json(updatedState.state)
    } catch (err) {
      console.error(err)
      return res.status(500).send('Failed to update state')
    }
  }

  static async getStateBySlotNumber(req, res) {
    const { shell_id, slot_number } = req.params
    const { user_id } = req.user

    if (!shell_id || !slot_number) return res.status(400).send('Missing shell or slot number')
      try {
        const state = await StateModel.getStateBySlot({ shell_id, slot_number, user_id })
        if (state.error) {
          return res.status(500).send('Failed to get state')
        }
        return res.json(state.state)
      } catch (err) {
        console.error(err)
        return res.status(500).send('Failed to get state')
      }
  
  }
}
