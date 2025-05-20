import React from 'react';
import { BarChart } from 'lucide-react';
import '../../styles/Relatorio/header.css';

const Header = () => {
  return (
    <div className="page-header">
      <h1 className="header-title"> 
        <BarChart className="header-icon" size={24} />
        <span>Relatórios do Sistema</span>
      </h1>
    </div>
  );
};

export default Header;