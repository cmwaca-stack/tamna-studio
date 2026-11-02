import { createBrowserRouter } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import Home from './pages/Home'
import Explore from './pages/Explore'
import Discover from './pages/Discover'
import DiscoverDetail from './pages/DiscoverDetail'
import PlaceInfo from './pages/PlaceInfo'
import Jejueo from './pages/Jejueo'
import Kit from './pages/Kit'
import Guide from './pages/Guide'
import Notes from './pages/Notes'
import NotFound from './pages/NotFound'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: 'discover', element: <Discover /> },
      { path: 'discover/:slug', element: <DiscoverDetail /> },
      { path: 'explore', element: <Explore /> },
      { path: 'place/:id', element: <PlaceInfo /> },
      { path: 'jejueo', element: <Jejueo /> },
      { path: 'kit', element: <Kit /> },
      { path: 'guide', element: <Guide /> },
      { path: 'notes', element: <Notes /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])
