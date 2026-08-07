import { FontStoreProvider } from './lib/fontStore'
import Sidebar from './components/typlab/Sidebar'
import ComparisonCanvas from './components/typlab/ComparisonCanvas'

function App() {
  return (
    <FontStoreProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <ComparisonCanvas />
        </main>
      </div>
    </FontStoreProvider>
  )
}

export default App
