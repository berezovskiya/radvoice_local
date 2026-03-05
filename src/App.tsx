import AppLayout from './components/Layout/AppLayout'
import TemplateEditorPage from './components/TemplateEditorPage/TemplateEditorPage'
import { useAppViewStore } from './store/useAppViewStore'

function App() {
  const currentView = useAppViewStore((s) => s.currentView)
  return currentView === 'templateEditor' ? <TemplateEditorPage /> : <AppLayout />
}

export default App
