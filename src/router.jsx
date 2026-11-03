import { createBrowserRouter, Navigate } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import Home from './pages/Home'
import Explore from './pages/Explore'
import DiscoverDetail from './pages/DiscoverDetail'
import PlaceInfo from './pages/PlaceInfo'
import Jejueo from './pages/Jejueo'
import Tamna from './pages/Tamna'
import Kit from './pages/Kit'
import Guide from './pages/Guide'
import LinkPage from './pages/LinkPage'
import OlleCourse from './pages/OlleCourse'
import NotFound from './pages/NotFound'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: 'discover', element: <Navigate to="/" replace /> },
      { path: 'discover/:slug', element: <DiscoverDetail /> },
      { path: 'explore', element: <Explore /> },
      { path: 'place/:id', element: <PlaceInfo /> },
      { path: 'jejueo', element: <Jejueo /> },
      { path: 'tamna', element: <Tamna /> },
      { path: 'kit', element: <Kit /> },
      { path: 'guide', element: <Guide /> },
      { path: 'links/:kind', element: <LinkPage /> },
      { path: 'olle/:no', element: <OlleCourse /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])
