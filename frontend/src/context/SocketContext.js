import { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [dadosRelatorios, setDadosRelatorios] = useState(null);
  const [loading, setLoading] = useState(true);
  const [motoristas, setMotoristas] = useState([]);
  const [isConnected, setIsConnected] = useState(false); // Novo estado para conexão

  useEffect(() => {
    const socketInstance = io(process.env.REACT_APP_WS_URL || 'ws://192.168.0.92:1120', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      autoConnect: true,
      timeout: 20000
    });

    // Eventos de conexão
    socketInstance.on('connect', () => {
      console.log('✅ Conectado ao WebSocket');
      setIsConnected(true);
      
      // Carrega dados iniciais
      socketInstance.emit('obterRelatorios', {}, (response) => {
        if (response?.success) {
          setDadosRelatorios(response.data);
        }
        setLoading(false);
      });

      socketInstance.emit('obterMotoristas', {}, (response) => {
        if (response?.success) {
          setMotoristas(response.data);
        }
      });
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('❌ Desconectado:', reason);
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        socketInstance.connect(); // Tentar reconectar manualmente
      }
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Erro de conexão:', err.message);
      setIsConnected(false);
      setTimeout(() => socketInstance.connect(), 1000);
    });

    socketInstance.on('dadosRelatorios', (data) => {
      console.log('📊 Dados recebidos via socket:', data);
      setDadosRelatorios(data);
    });

    socketInstance.on('erroRelatorios', (erro) => {
      console.error('Erro no socket:', erro);
      setLoading(false);
    });
    socketInstance.on('viagem-atualizada', (viagem) => {
      console.log('Viagem atualizada recebida:', viagem);
    });

    // Atualiza o estado do socket
    setSocket(socketInstance);

    return () => {
      socketInstance.off('connect');
      socketInstance.off('disconnect');
      socketInstance.off('connect_error');
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ 
      socket, 
      dadosRelatorios, 
      loading,
      motoristas,
      isConnected // Disponibiliza o estado da conexão
    }}>
      {children}
    </SocketContext.Provider>
  );
};