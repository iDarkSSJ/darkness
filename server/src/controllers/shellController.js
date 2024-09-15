import bcrypt from 'bcrypt'
import {
  deleteImageFromCloud,
  deleteRawFromCloud,
  uploadToCloud,
} from '../config/cloudinaryConfig.js'
import { pool } from '../models/postgreRender/db.js'
import { ShellModel } from '../models/postgreRender/shellModel.js'
import { UserModel } from '../models/postgreRender/user.js'
import { validateShell } from '../schemas/shellSchema.js'

const MAX_ROM_SIZE = 32 * 1024 * 1024

export class ShellController {
  static async createShell(req, res) {
    const { user_id } = req.user
    const { shell_name, shell_core } = req.body
    const { shell_rom, shell_cover } = req.files

    if (!shell_rom) return res.status(400).send({ error: 'ROM file is required.' })

    const inputsAccepted = validateShell({ shell_name, shell_core })
    if (!inputsAccepted.success) return res.status(400).send({ error: 'Invalid shell data.' })

    const romFile = shell_rom[0]

    if (romFile.size > MAX_ROM_SIZE) {
      return res.status(400).send({ error: 'Maximum ROM size exceeded.' })
    }

    try {
      let coverUrl = null
      let coverPublicId = null

      if (shell_cover) {
        const coverFile = shell_cover[0]
        const coverUploadResponse = await uploadToCloud(coverFile.buffer, 'covers')
        coverUrl = coverUploadResponse.secure_url
        coverPublicId = coverUploadResponse.public_id
      }
      // const zipBuffer = await compressToZipInMemory(romFile.buffer)
      // now the frontend compresses the file

      const romUploadResult = await uploadToCloud(romFile.buffer, 'roms', 'raw')

      const shellSchema = {
        shell_name,
        shell_core,
        shell_rom_url: romUploadResult.secure_url,
        shell_rom_public_id: romUploadResult.public_id,
        shell_cover_url: coverUrl,
        shell_cover_public_id: coverPublicId,
      }

      const newShell = await ShellModel.createShell({
        user_id,
        shell: shellSchema,
      })

      if (newShell.error) {
        await deleteRawFromCloud(romUploadResult.public_id)
        await deleteImageFromCloud(coverPublicId)
        return res.status(400).send({ error: 'Failed to create shell' })
      }

      return res.status(200).json(newShell.shell)
    } catch (err) {
      console.error('Error creating shell:', err)
      return res.status(500).send({ error: 'Internal Server Error, Please try again' })
    }
  }

  static async getShellsByUser(req, res) {
    const { user_id } = req.user
    if (!user_id) return res.status(400).send({ error: 'User not found' })

    try {
      const shells = await ShellModel.getShellsByUserId({ user_id })
      if (shells.error)
        return res.status(500).send({ error: 'Internal Server Error, Please try again' })
      if (!shells.shells) return res.status(404).send({ error: 'No shells found' })
      return res.json(shells.shells)
    } catch (err) {
      console.error('Error fetching shells:', err)
      return res.status(500).json({ error: 'Internal Server Error, Please try again' })
    }
  }

  static async getShellById(req, res) {
    const { user_id } = req.user
    const { shell_id } = req.params

    if (!user_id || !shell_id) return res.status(400).send('Missing user or shell id')
    try {
      const shell = await ShellModel.getShellById({ shell_id, user_id })
      if (shell.error) {
        return res.status(500).send('Failed to fetch shell')
      }
      return res.json(shell.shell)
    } catch (err) {
      console.error('Error fetching shell:', err)
      return res.status(500).send('Internal Server Error, Please try again')
    }
  }

  static async updateShell(req, res) {
    const { user_id } = req.user
    const { shell_id } = req.params
    const { shell_name } = req.body
    const { shell_cover } = req.files

    try {
      const shellFound = await ShellModel.getShellById({ shell_id, user_id })
      if (shellFound.error) {
        return res.status(500).send('Failed to fetch shell')
      }
      if (!shellFound.shell) return res.status(404).send('Shell not found')

      const { shell_cover_public_id } = shellFound.shell

      let newCoverUrl = shellFound.shell.shell_cover_url
      let newCoverPublicId = shell_cover_public_id

      if (shell_cover) {
        const coverFile = shell_cover[0]
        if (shell_cover_public_id) {
          await deleteImageFromCloud(shell_cover_public_id)
        }
        const coverUploadResponse = await uploadToCloud(coverFile.buffer, 'covers')

        newCoverUrl = coverUploadResponse.secure_url
        newCoverPublicId = coverUploadResponse.public_id
      }

      const shellSchema = {
        shell_id,
        shell_name,
        shell_cover_url: newCoverUrl,
        shell_cover_public_id: newCoverPublicId,
      }

      const updateShell = await ShellModel.updateShell({ user_id, shell: shellSchema })
      if (updateShell.error) {
        return res.status(500).send('Failed to update shell')
      }

      return res.json(updateShell)
    } catch (err) {
      console.error('Error updating shell:', err)
      return res.status(500).send('Internal Server Error, Please try again')
    }
  }

  static async deleteShell(req, res) {
    const { user_id } = req.user
    const { shell_id } = req.params
    const { confirm_password } = req.body

    if (!user_id || !shell_id) return res.status(400).send('Missing user or shell id.')
    if (!confirm_password) return res.status(400).send('Missing confirm password.')

    const client = await pool.connect()
    try {
      const userFound = await UserModel.findUserById({ user_id })
      if (userFound.error) {
        return res.status(500).send('Failed to fetch user')
      }
      const isMatches = bcrypt.compare(confirm_password, userFound.user.user_password)
      if (!isMatches) return res.status(400).send('Invalid confirm password.')

      const shellFound = await ShellModel.getShellById({ shell_id, user_id })
      if (shellFound.error) {
        return res.status(500).send('Failed to fetch shell')
      }
      if (!shellFound.shell) return res.status(404).send('Shell not found')

      const { shell_cover_public_id, shell_rom_public_id } = shellFound.shell

      if (shell_cover_public_id) {
        await deleteImageFromCloud(shell_cover_public_id)
      }
      if (shell_rom_public_id) {
        await deleteRawFromCloud(shell_rom_public_id)
      }
      const deleteShell = await ShellModel.deleteShellById({ shell_id, user_id })

      if (deleteShell.error) {
        return res.status(500).send('Failed to delete shell')
      }
      return res.status(200).send('Shell deleted successfully.')
    } catch (err) {
      console.error('Error deleting shell:', err)
      return res.status(500).send('Internal Server Error, Please try again')
    } finally {
      if (client) client.release()
    }
  }
}
