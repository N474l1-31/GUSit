export interface AllUsuarios {        // GET  =>  http://192.168.1.147:8080/api/sparkle/MuestraUsuarios/
  idUsuario: number,
  nombre : string,
  apellidoPrimero : string,
  apellidoSegundo : string,
  usuario : string,
  area: string,
  idArea: number,
  idStatus: number,
  statuss: string,
  Sistema: string,
}

export interface SearchUsuarioSistemas {        // GET  =>  http://192.168.1.147:8080/api/sparkle/Busca/{usuario}
  usuario: string;
  statusUsuario: string;
  Sistema: string;
  statusSistema: string;
  perfil: string;
  statusPerfil: string;
  StatusUsuarioSistemaPerfil: string
  }

export interface users {        // GET  =>  http://192.168.1.147:8080/api/sparkle/Muestra/VerUsuarios
  idUsuario: number,
  usuario: string,
}

