export interface Viagem {
  _id: string;
  local: string;
  setor: string;
  passageiros: number;
  saida: string;
  solicitadoPor?: {
    name: string;
  };
}

export interface Motorista {
  _id: string;
  nome: string;
  status: string;
}

export interface Veiculo {
  _id: string;
  modelo: string;
  placa: string;
  status: string;
}

export interface ApiError {
  message: string;
}
