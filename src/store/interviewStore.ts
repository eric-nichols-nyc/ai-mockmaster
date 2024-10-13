import { create } from 'zustand'

interface BlobState {
  currentBlob: Blob | null;
  setCurrentBlob: (blob: Blob | null) => void;
}

const useBlobStore = create<BlobState>((set) => ({
  currentBlob: null,
  setCurrentBlob: (blob) => set({ currentBlob: blob }),
}))

export default useBlobStore
