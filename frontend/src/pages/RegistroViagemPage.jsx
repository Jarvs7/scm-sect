import React from 'react';
import { ListaViagensPendentes } from '../components/RegistroViagem';
import Menu from '../components/Menu/Menu';
import '../styles/RegistroViagem/registroviagem.css';
import '../styles/RegistroViagem/arrumarcard.css';

const RegistroViagemPage = () => {
  return (
    <>
      <Menu visible={true} />
      <div className="container-fluid mt-3">
        <div className="row">
          <div className="col-md-12 ">
            
            <ListaViagensPendentes />
          </div>
        </div>
      </div>
    </>
  );
};

export default RegistroViagemPage;
