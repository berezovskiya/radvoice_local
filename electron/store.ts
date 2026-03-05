import Store from 'electron-store'

interface StoreSchema {
  openrouterApiKey: string
  whisperModelPath: string
  horosDbPath: string
}

let _store: Store<StoreSchema> | null = null

function getStore(): Store<StoreSchema> {
  if (!_store) {
    _store = new Store<StoreSchema>({
      defaults: {
        openrouterApiKey: '',
        whisperModelPath: '',
        horosDbPath: '',
      },
      encryptionKey: 'radvoice-v1',
    })
  }
  return _store
}

export default getStore
