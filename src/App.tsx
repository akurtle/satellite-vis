import './App.css'
import Banner from './components/Banner.tsx'
import Visualizer from './components/Visualizer.tsx'

import './leaflet.css'

function App() {

  return (
    <div className='bg-linear-to-b from-[#000814] via-[#001D3D] to-[#003566] h-screen'>
      {/* <Navbar/> */}
      <Banner/>
      {/* <ParallaxSection/> */}
      <Visualizer/>
    </div>
  )
}

export default App
