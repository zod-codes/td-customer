import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import RootLayout from "./components/RootLayout.jsx";
import HomePage from './components/HomePage.jsx';
import CreateYourAccount from './components/CreateYourAccount.jsx';
import ContactUs from './components/ContactUs.jsx';
import Login from './components/Login.jsx';
import InfoDisplay from './components/InfoDisplay.jsx';
import Confirmation from './components/confirmation.jsx';
import NotFound from './components/NotFound.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: '/ContactUsPage',
        element: <ContactUs />
      },
      {
        path: '/CreateYourAccount',
        element: <CreateYourAccount />
      },
      {
        path: '/Login',
        element: <Login />
      },
      {
        path: '/InfoDisplay',
        element: <InfoDisplay />
      },
      {
        path: '/Confirmation',
        element: <Confirmation />
      }
    ]
  }
], { basename: '/td-customer' });


function App() {

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
