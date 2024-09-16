import bcrypt from 'bcrypt'
import { deleteImageFromCloud, deleteRawFromCloud } from '../config/cloudinaryConfig.js'
import { validateShell } from '../schemas/shellSchema.js'

export class ShellController {
  constructor({ shellModel, userModel, stateModel }) {
    this.shellModel = shellModel
    this.userModel = userModel
    this.stateModel = stateModel
  }

  createShell = async (req, res) => {
    const { user_id } = req.user
    const {
      shell_name,
      shell_core,
      shell_rom_url,
      shell_rom_public_id,
      shell_cover_url,
      shell_cover_public_id,
    } = req.body

    console.log({
      shell_name,
      shell_core,
      shell_rom_url,
      shell_rom_public_id,
      shell_cover_url,
      shell_cover_public_id,
    })

    if (!shell_rom_url || !shell_rom_public_id) {
      return res.status(400).send({ error: 'Error fetching cover or rom.' })
    }

    const inputsAccepted = validateShell({ shell_name, shell_core })
    if (!inputsAccepted.success) {
      return res.status(400).send({ error: 'Invalid shell data.' })
    }

    try {
      let coverUrl = null
      let coverPublicId = null
      if (shell_cover_url && shell_cover_public_id) {
        coverUrl = shell_cover_url
        coverPublicId = shell_cover_public_id
      }

      const shellSchema = {
        shell_name,
        shell_core,
        shell_rom_url,
        shell_rom_public_id,
        shell_cover_url: coverUrl,
        shell_cover_public_id: coverPublicId,
      }

      const newShell = await this.shellModel.createShell({
        user_id,
        shell: shellSchema,
      })

      if (newShell.error) {
        return res.status(400).send({ error: 'Failed to create shell' })
      }

      return res.status(200).json(newShell.shell)
    } catch (err) {
      console.error('Error creating shell:', err)
      return res.status(500).send({ error: 'Internal Server Error, Please try again' })
    }
  }

  getShellsByUser = async (req, res) => {
    const { user_id } = req.user
    if (!user_id) return res.status(400).send({ error: 'User not found' })

    try {
      const shells = await this.shellModel.getShellsByUserId({ user_id })
      if (shells.error)
        return res.status(500).send({ error: 'Internal Server Error, Please try again' })
      if (!shells.shells) return res.status(404).send({ error: 'No shells found' })
      return res.json(shells.shells)
    } catch (err) {
      console.error('Error fetching shells:', err)
      return res.status(500).json({ error: 'Internal Server Error, Please try again' })
    }
  }

  getShellById = async (req, res) => {
    const { user_id } = req.user
    const { shell_id } = req.params

    if (!user_id || !shell_id) return res.status(400).send('Missing user or shell id')
    try {
      const shell = await this.shellModel.getShellById({ shell_id, user_id })
      if (shell.error) {
        return res.status(500).send('Failed to fetch shell')
      }
      return res.json(shell.shell)
    } catch (err) {
      console.error('Error fetching shell:', err)
      return res.status(500).send('Internal Server Error, Please try again')
    }
  }

  updateShell = async (req, res) => {
    const { user_id } = req.user
    const { shell_id } = req.params
    const { shell_name, shell_cover_url, shell_cover_public_id } = req.body

    try {
      const shellFound = await this.shellModel.getShellById({ shell_id, user_id })
      if (shellFound.error) {
        return res.status(500).send({ error: 'Failed to fetch shell' })
      }
      if (!shellFound.shell) {
        return res.status(404).send({ error: 'Shell not found' })
      }

      const { shell_cover_public_id: existingCoverPublicId } = shellFound.shell
      if (existingCoverPublicId) {
        await deleteImageFromCloud(existingCoverPublicId)
      }

      const newCoverUrl = shell_cover_url || shellFound.shell.shell_cover_url
      const newCoverPublicId = shell_cover_public_id || existingCoverPublicId

      const shellSchema = {
        shell_id,
        shell_name,
        shell_cover_url: newCoverUrl,
        shell_cover_public_id: newCoverPublicId,
      }

      const updateShell = await this.shellModel.updateShell({
        user_id,
        shell: shellSchema,
      })
      if (updateShell.error) {
        return res.status(500).send({ error: 'Failed to update shell' })
      }

      return res.json(updateShell.shell)
    } catch (err) {
      console.error('Error updating shell:', err)
      return res.status(500).send({ error: 'Internal Server Error, Please try again' })
    }
  }

  deleteShell = async (req, res) => {
    const { user_id } = req.user
    const { shell_id } = req.params
    const { confirm_password } = req.query

    if (!user_id || !shell_id) return res.status(400).send('Missing user or shell id.')
    if (!confirm_password) return res.status(400).send('Missing confirm password.')

    try {
      const userFound = await this.userModel.findUserById({ user_id })
      if (userFound.error) {
        return res.status(500).send('Failed to fetch user')
      }
      const isMatches = bcrypt.compare(confirm_password, userFound.user.user_password)
      if (!isMatches) return res.status(400).send('Invalid confirm password.')

      const shellFound = await this.shellModel.getShellById({ shell_id, user_id })
      if (shellFound.error) {
        return res.status(500).send('Failed to fetch shell')
      }
      if (!shellFound.shell) return res.status(404).send('Shell not found')

      const { states } = await this.stateModel.getStatesById({ shell_id, user_id })
      if (states && states.length > 0) {
        for (const state of states) {
          if (state.state_public_id) {
            await deleteRawFromCloud(state.state_public_id)
          }
        }
      }

      const { shell_cover_public_id, shell_rom_public_id } = shellFound.shell

      if (shell_cover_public_id) {
        await deleteImageFromCloud(shell_cover_public_id)
      }
      if (shell_rom_public_id) {
        await deleteRawFromCloud(shell_rom_public_id)
      }
      const deleteShell = await this.shellModel.deleteShellById({ shell_id, user_id })

      if (deleteShell.error) {
        return res.status(500).send('Failed to delete shell')
      }
      return res.status(200).send('Shell deleted successfully.')
    } catch (err) {
      console.error('Error deleting shell:', err)
      return res.status(500).send('Internal Server Error, Please try again')
    }
  }
}
