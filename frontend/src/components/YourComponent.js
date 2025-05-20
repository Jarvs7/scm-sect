import React, { useEffect, useState } from 'react';
import socket from '../socket';

const YourComponent = () => {
    const [motoristas, setMotoristas] = useState([]);
    const [veiculos, setVeiculos] = useState([]);

    useEffect(() => {
        // Solicitar motoristas disponíveis
        socket.emit('obterMotoristas');

        // Receber motoristas atualizados
        socket.on('atualizarMotoristas', (motoristas) => {
            setMotoristas(motoristas);
        });

        // Solicitar veículos disponíveis
        socket.emit('obterVeiculos');

        // Receber veículos atualizados
        socket.on('atualizarVeiculos', (veiculos) => {
            setVeiculos(veiculos);
        });

        // Limpar os listeners quando o componente for desmontado
        return () => {
            socket.off('atualizarMotoristas');
            socket.off('atualizarVeiculos');
        };
    }, []);

    return (
        <div>
            <h1>Motoristas Disponíveis</h1>
            <ul>
                {motoristas.map((motorista) => (
                    <li key={motorista._id}>{motorista.nome}</li>
                ))}
            </ul>

            <h1>Veículos Disponíveis</h1>
            <ul>
                {veiculos.map((veiculo) => (
                    <li key={veiculo._id}>{veiculo.nome}</li>
                ))}
            </ul>
        </div>
    );
};

export default YourComponent;