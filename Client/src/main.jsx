import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx'
import UserContextProvider from './context/UserContext.jsx';
import MessageContextProvider from './context/MessageContext.jsx';

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <UserContextProvider>
            <MessageContextProvider>
                <App />
            </MessageContextProvider>
        </UserContextProvider>
    </BrowserRouter>
)
