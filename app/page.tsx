'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  registrarUsuario,
  iniciarSesionUsuario,
  cerrarSesionUsuario,
  guardarNota,
  obtenerNotas,
  eliminarNota,
  guardarPaginaWeb,
  obtenerPaginasWeb,
  eliminarPaginaWeb,
  guardarCuenta,
  obtenerCuentas,
  eliminarCuenta,
  guardarCategoria,
  obtenerCategorias,
  eliminarCategoria,
  guardarSubcategoria,
  obtenerSubcategorias,
  eliminarSubcategoria,
  eliminarTodasLasNotas as eliminarTodasLasNotasFirebase
} from '@/lib/firebaseService';
import './styles.css';

interface Nota {
  id: string;
  titulo: string;
  contenido: string;
  categoriaId: string;
  subcategoriaId?: string;
  fechaCreacion: Date;
}

interface PaginaWeb {
  id: string;
  nombreSitio: string;
  enlace: string;
  descripcion: string;
  fechaCreacion: Date;
}

interface Cuenta {
  id: string;
  nombreCuenta: string;
  usuario: string;
  contraseña: string;
  fechaCreacion: Date;
}

interface Categoria {
  id: string;
  nombre: string;
  color: string;
}

interface Subcategoria {
  id: string;
  nombre: string;
  categoriaId: string;
  color: string;
}

export default function AdminadorNotas() {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [cargando, setCargando] = useState(true);
  const [emailLogin, setEmailLogin] = useState('');
  const [contraseñaLogin, setContraseñaLogin] = useState('');
  const [esRegistro, setEsRegistro] = useState(false);
  const [emailRegistro, setEmailRegistro] = useState('');
  const [contraseñaRegistro, setContraseñaRegistro] = useState('');
  const [confirmarContraseña, setConfirmarContraseña] = useState('');
  const [errorAuth, setErrorAuth] = useState('');

  const [notas, setNotas] = useState<Nota[]>([]);
  const [paginasWeb, setPaginasWeb] = useState<PaginaWeb[]>([]);
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);

  const [notaSeleccionada, setNotaSeleccionada] = useState<Nota | null>(null);
  const [paginaWebSeleccionada, setPaginaWebSeleccionada] = useState<PaginaWeb | null>(null);
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState<Cuenta | null>(null);
  const [modoNoche, setModoNoche] = useState(false);
  const [mostrarFormularioCategoria, setMostrarFormularioCategoria] = useState(false);
  const [mostrarSelectorColores, setMostrarSelectorColores] = useState(false);
  const [nombreCategoria, setNombreCategoria] = useState('');
  const [colorCategoria, setColorCategoria] = useState('#FF6B6B');
  const [editandoCategoria, setEditandoCategoria] = useState<string | null>(null);
  const [nombreCategoriaEdicion, setNombreCategoriaEdicion] = useState('');
  const [colorCategoriaEdicion, setColorCategoriaEdicion] = useState('');
  const [mostrarSelectorColoresEdicion, setMostrarSelectorColoresEdicion] = useState(false);
  
  const [tituloEditable, setTituloEditable] = useState('');
  const [contenidoEditable, setContenidoEditable] = useState('');
  const [categoriaEditable, setCategoriaEditable] = useState('');
  const [tituloOriginal, setTituloOriginal] = useState('');
  const [contenidoOriginal, setContenidoOriginal] = useState('');
  const [categoriaOriginal, setCategoriaOriginal] = useState('');
  const [hayChanges, setHayChanges] = useState(false);
  
  const [nombreSitioEditable, setNombreSitioEditable] = useState('');
  const [enlacePaginaEditable, setEnlacePaginaEditable] = useState('');
  const [descripcionPaginaEditable, setDescripcionPaginaEditable] = useState('');
  const [nombreSitioOriginal, setNombreSitioOriginal] = useState('');
  const [enlacePaginaOriginal, setEnlacePaginaOriginal] = useState('');
  const [descripcionPaginaOriginal, setDescripcionPaginaOriginal] = useState('');
  const [hayChangesPagina, setHayChangesPagina] = useState(false);
  
  const [nombreCuentaEditable, setNombreCuentaEditable] = useState('');
  const [usuarioCuentaEditable, setUsuarioCuentaEditable] = useState('');
  const [contraseñaCuentaEditable, setContraseñaCuentaEditable] = useState('');
  const [nombreCuentaOriginal, setNombreCuentaOriginal] = useState('');
  const [usuarioCuentaOriginal, setUsuarioCuentaOriginal] = useState('');
  const [contraseñaCuentaOriginal, setContraseñaCuentaOriginal] = useState('');
  const [hayChangesCuenta, setHayChangesCuenta] = useState(false);
  
  const [creandoNota, setCreandoNota] = useState(false);
  const [creandoPagina, setCreandoPagina] = useState(false);
  const [creandoCuenta, setCreandoCuenta] = useState(false);

  const [notificacionCopiar, setNotificacionCopiar] = useState<string | null>(null);
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  const [categoriaVistaActual, setCategoriaVistaActual] = useState<string | null>(null);
  const [subcategoriaVistaActual, setSubcategoriaVistaActual] = useState<string | null>(null);
  
  // Estados para subcategorías
  const [mostrarFormularioSubcategoria, setMostrarFormularioSubcategoria] = useState(false);
  const [nombreSubcategoria, setNombreSubcategoria] = useState('');
  const [colorSubcategoria, setColorSubcategoria] = useState('#667eea');
  const [subcategoriaEditable, setSubcategoriaEditable] = useState('');
  
  // Agregar estado para modal de configuración
  const [mostrarModalConfiguracion, setMostrarModalConfiguracion] = useState(false);
  
  // Estados para modal de confirmación de categoría
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] = useState(false);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState<Categoria | null>(null);

  const paletaColoresCompleta = [
    '#E53935', '#D32F2F', '#C62828', '#B71C1C',
    '#F4511E', '#E64A19', '#D84315', '#BF360C',
    '#FB8C00', '#F57C00', '#EF6C00', '#E65100',
    '#FDD835', '#FBC02D', '#F9A825', '#F57F17',
    '#7CB342', '#689F38', '#558B2F', '#33691E',
    '#00897B', '#00796B', '#00695C', '#004D40',
    '#039BE5', '#0288D1', '#0277BD', '#01579B',
    '#1E88E5', '#1976D2', '#1565C0', '#0D47A1',
    '#5E35B1', '#512DA8', '#4527A0', '#311B92',
    '#8E24AA', '#7B1FA2', '#6A1B9A', '#4A148C',
    '#D81B60', '#C2185B', '#AD1457', '#880E4F',
    '#6D4C41', '#5D4037', '#4E342E', '#3E2723',
    '#546E7A', '#455A64', '#37474F', '#263238',
  ];

  const [indiceAnimacion, setIndiceAnimacion] = useState(0);
  const [posicionIcono, setPosicionIcono] = useState({ top: '20%', left: '20%' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUsuario(user);
      if (user) {
        await cargarDatosUsuario(user.uid);
      } else {
        setNotas([]);
        setPaginasWeb([]);
        setCuentas([]);
        setCategorias([]);
        setNotaSeleccionada(null);
      }
      setCargando(false);
    });
    return () => unsubscribe();
  }, []);

  const cargarDatosUsuario = async (userId: string) => {
    const [notasRes, paginasRes, cuentasRes, categoriasRes] = await Promise.all([
      obtenerNotas(userId),
      obtenerPaginasWeb(userId),
      obtenerCuentas(userId),
      obtenerCategorias(userId)
    ]);

    if (notasRes.success) setNotas(notasRes.notas || []);
    if (paginasRes.success) setPaginasWeb(paginasRes.paginas || []);
    if (cuentasRes.success) setCuentas(cuentasRes.cuentas || []);
    if (categoriasRes.success && categoriasRes.categorias && categoriasRes.categorias.length > 0) {
      setCategorias(categoriasRes.categorias);
    } else {
      const categoriasDefault = [
        { id: Date.now().toString(), nombre: 'Personal', color: '#FF6B6B' },
        { id: (Date.now() + 1).toString(), nombre: 'Trabajo', color: '#4ECDC4' },
      ];
      setCategorias(categoriasDefault);
      for (const cat of categoriasDefault) {
        await guardarCategoria(userId, cat);
      }
    }
  };

  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndiceAnimacion((prev) => (prev + 1) % 4);
      
      const posicionesValidas = [
        { top: '15%', left: '15%' },
        { top: '15%', left: '50%' },
        { top: '15%', left: '85%' },
        { top: '50%', left: '10%' },
        { top: '50%', left: '90%' },
        { top: '85%', left: '15%' },
        { top: '85%', left: '50%' },
        { top: '85%', left: '85%' },
      ];
      
      const posicionAleatoria = posicionesValidas[Math.floor(Math.random() * posicionesValidas.length)];
      setPosicionIcono(posicionAleatoria);
    }, 2500);
    return () => clearInterval(intervalo);
  }, []);

  const elementosAnimacion = [
    { tipo: 'nota', icono: '📄', nombre: 'Notas' },
    { tipo: 'enlace', icono: '🔗', nombre: 'Enlaces' },
    { tipo: 'contraseña', icono: '🔐', nombre: 'Contraseñas' },
    { tipo: 'cuenta', icono: '👤', nombre: 'Cuentas' },
  ];

  const iniciarSesion = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorAuth('');
    const resultado = await iniciarSesionUsuario(emailLogin, contraseñaLogin);
    if (resultado.success) {
      setEmailLogin('');
      setContraseñaLogin('');
    } else {
      setErrorAuth('Credenciales incorrectas');
    }
  };

  const registrarse = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorAuth('');
    if (contraseñaRegistro !== confirmarContraseña) {
      setErrorAuth('Las contraseñas no coinciden');
      return;
    }
    const resultado = await registrarUsuario(emailRegistro, contraseñaRegistro);
    if (resultado.success) {
      setEmailRegistro('');
      setContraseñaRegistro('');
      setConfirmarContraseña('');
    } else {
      setErrorAuth(resultado.error || 'Error al crear cuenta');
    }
  };

  const cerrarSesion = async () => {
    await cerrarSesionUsuario();
    setEsRegistro(false);
    setMostrarModalConfiguracion(false);
  };

  const eliminarTodasLasNotas = async () => {
    if (!usuario) return;
    if (confirm('¿Estás seguro de que deseas eliminar TODAS las notas? Esta acción no se puede deshacer.')) {
      await eliminarTodasLasNotasFirebase(usuario.uid);
      setNotas([]);
      setNotaSeleccionada(null);
    }
  };

  const exportarDatos = () => {
    const datosExportar = {
      notas,
      paginasWeb,
      cuentas,
      categorias,
      fechaExportacion: new Date().toLocaleString('es-ES'),
    };
    const elemento = document.createElement('a');
    elemento.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(datosExportar, null, 2));
    elemento.download = `backup-notas-${new Date().getTime()}.json`;
    document.body.appendChild(elemento); // Use document instead of documento
    elemento.click();
    document.body.removeChild(elemento); // Use document instead of documento
  };

  useEffect(() => {
    if (notaSeleccionada) {
      setTituloEditable(notaSeleccionada.titulo);
      setContenidoEditable(notaSeleccionada.contenido);
      setCategoriaEditable(notaSeleccionada.categoriaId);
      setTituloOriginal(notaSeleccionada.titulo);
      setContenidoOriginal(notaSeleccionada.contenido);
      setCategoriaOriginal(notaSeleccionada.categoriaId);
      setHayChanges(false);
      setCreandoNota(false);
    }
  }, [notaSeleccionada]);

  useEffect(() => {
    if (paginaWebSeleccionada) {
      setNombreSitioEditable(paginaWebSeleccionada.nombreSitio);
      setEnlacePaginaEditable(paginaWebSeleccionada.enlace);
      setDescripcionPaginaEditable(paginaWebSeleccionada.descripcion);
      setNombreSitioOriginal(paginaWebSeleccionada.nombreSitio);
      setEnlacePaginaOriginal(paginaWebSeleccionada.enlace);
      setDescripcionPaginaOriginal(paginaWebSeleccionada.descripcion);
      setHayChangesPagina(false);
      setCreandoPagina(false);
    }
  }, [paginaWebSeleccionada]);

  useEffect(() => {
    if (cuentaSeleccionada) {
      setNombreCuentaEditable(cuentaSeleccionada.nombreCuenta);
      setUsuarioCuentaEditable(cuentaSeleccionada.usuario);
      setContraseñaCuentaEditable(cuentaSeleccionada.contraseña);
      setNombreCuentaOriginal(cuentaSeleccionada.nombreCuenta);
      setUsuarioCuentaOriginal(cuentaSeleccionada.usuario);
      setContraseñaCuentaOriginal(cuentaSeleccionada.contraseña);
      setHayChangesCuenta(false);
      setCreandoCuenta(false);
    }
  }, [cuentaSeleccionada]);

  useEffect(() => {
    if (creandoNota) return;
    const cambios = tituloEditable !== tituloOriginal || 
                    contenidoEditable !== contenidoOriginal || 
                    categoriaEditable !== categoriaOriginal;
    setHayChanges(cambios);
  }, [tituloEditable, contenidoEditable, categoriaEditable, tituloOriginal, contenidoOriginal, categoriaOriginal, creandoNota]);

  useEffect(() => {
    if (creandoPagina) return;
    const cambios = nombreSitioEditable !== nombreSitioOriginal || 
                    enlacePaginaEditable !== enlacePaginaOriginal || 
                    descripcionPaginaEditable !== descripcionPaginaOriginal;
    setHayChangesPagina(cambios);
  }, [nombreSitioEditable, enlacePaginaEditable, descripcionPaginaEditable, nombreSitioOriginal, enlacePaginaOriginal, descripcionPaginaOriginal, creandoPagina]);

  useEffect(() => {
    if (creandoCuenta) return;
    const cambios = nombreCuentaEditable !== nombreCuentaOriginal || 
                    usuarioCuentaEditable !== usuarioCuentaOriginal || 
                    contraseñaCuentaEditable !== contraseñaCuentaOriginal;
    setHayChangesCuenta(cambios);
  }, [nombreCuentaEditable, usuarioCuentaEditable, contraseñaCuentaEditable, nombreCuentaOriginal, usuarioCuentaOriginal, contraseñaCuentaOriginal, creandoCuenta]);

  // Cargar subcategorías cuando el usuario está autenticado
  useEffect(() => {
    if (usuario) {
      const cargarSubcategorias = async () => {
        const subcategoriasObtenidas = await obtenerSubcategorias(usuario.uid);
        setSubcategorias(subcategoriasObtenidas);
      };
      cargarSubcategorias();
    }
  }, [usuario]);

  const crearCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario || !nombreCategoria.trim()) return;
    
    const nuevaCategoria: Categoria = {
      id: Date.now().toString(),
      nombre: nombreCategoria,
      color: colorCategoria,
    };
    
    const resultado = await guardarCategoria(usuario.uid, nuevaCategoria);
    if (resultado.success) {
      setCategorias([...categorias, nuevaCategoria]);
      setNombreCategoria('');
      setColorCategoria('#FF6B6B');
      setMostrarFormularioCategoria(false);
      setMostrarSelectorColores(false);
    }
  };

  const guardarEdicionCategoria = async () => {
    if (!usuario || !editandoCategoria) return;
    
    const categoriaActualizada = {
      id: editandoCategoria,
      nombre: nombreCategoriaEdicion,
      color: colorCategoriaEdicion
    };
    
    const resultado = await guardarCategoria(usuario.uid, categoriaActualizada);
    if (resultado.success) {
      setCategorias(categorias.map((c) =>
        c.id === editandoCategoria ? categoriaActualizada : c
      ));
      setEditandoCategoria(null);
    }
  };

  const generarContraseña = () => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let contraseña = '';
    for (let i = 0; i < 16; i++) {
      contraseña += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    setContraseñaCuentaEditable(contraseña);
  };

  const copiarAlPortapapeles = (texto: string, tipo: string) => {
    navigator.clipboard.writeText(texto);
    setNotificacionCopiar(tipo);
    setTimeout(() => setNotificacionCopiar(null), 2000);
  };

  const crearNota = async () => {
    if (!usuario || !tituloEditable.trim()) return;
    
    const nuevaNota: Nota = {
      id: Date.now().toString(),
      titulo: tituloEditable,
      contenido: contenidoEditable,
      categoriaId: categoriaEditable,
      subcategoriaId: subcategoriaEditable || undefined,
      fechaCreacion: new Date().toISOString(),
    };
    
    const resultado = await guardarNota(usuario.uid, nuevaNota);
    if (resultado.success) {
      const notaConId = { ...nuevaNota, id: resultado.id || nuevaNota.id };
      setNotas([...notas, notaConId]);
      setCreandoNota(false);
      setNotaSeleccionada(notaConId);
      setTituloEditable('');
      setContenidoEditable('');
      setHayChanges(false);
    }
  };

  const guardarEdicionNota = async () => {
    if (!usuario || !notaSeleccionada || !hayChanges) return;
    
    const notaActualizada = {
      ...notaSeleccionada,
      titulo: tituloEditable,
      contenido: contenidoEditable,
      categoriaId: categoriaEditable,
      subcategoriaId: subcategoriaEditable || undefined
    };
    
    const resultado = await guardarNota(usuario.uid, notaActualizada);
    if (resultado.success) {
      const notasActualizadas = notas.map((n) =>
        n.id === notaSeleccionada.id ? notaActualizada : n
      );
      setNotas(notasActualizadas);
      setNotaSeleccionada(notaActualizada);
      setTituloOriginal(tituloEditable);
      setContenidoOriginal(contenidoEditable);
      setCategoriaOriginal(categoriaEditable);
      setHayChanges(false);
    }
  };

  const cancelarEdicionNota = () => {
    setTituloEditable(tituloOriginal);
    setContenidoEditable(contenidoOriginal);
    setCategoriaEditable(categoriaOriginal);
    setHayChanges(false);
  };

  const crearPaginaWeb = async () => {
    if (!usuario || !nombreSitioEditable.trim() || !enlacePaginaEditable.trim()) return;
    
    const nuevaPaginaWeb: PaginaWeb = {
      id: Date.now().toString(),
      nombreSitio: nombreSitioEditable,
      enlace: enlacePaginaEditable,
      descripcion: descripcionPaginaEditable,
      fechaCreacion: new Date().toISOString(),
    };
    
    const resultado = await guardarPaginaWeb(usuario.uid, nuevaPaginaWeb);
    if (resultado.success) {
      const paginaConId = { ...nuevaPaginaWeb, id: resultado.id || nuevaPaginaWeb.id };
      setPaginasWeb([...paginasWeb, paginaConId]);
      setCreandoPagina(false);
      setPaginaWebSeleccionada(paginaConId);
      setNombreSitioEditable('');
      setEnlacePaginaEditable('');
      setDescripcionPaginaEditable('');
      setHayChangesPagina(false);
    }
  };

  const guardarEdicionPaginaWeb = async () => {
    if (!usuario || !paginaWebSeleccionada || !hayChangesPagina) return;
    
    const paginaActualizada = {
      ...paginaWebSeleccionada,
      nombreSitio: nombreSitioEditable,
      enlace: enlacePaginaEditable,
      descripcion: descripcionPaginaEditable,
    };
    
    const resultado = await guardarPaginaWeb(usuario.uid, paginaActualizada);
    if (resultado.success) {
      const paginasActualizadas = paginasWeb.map((p) =>
        p.id === paginaWebSeleccionada.id ? paginaActualizada : p
      );
      setPaginasWeb(paginasActualizadas);
      setPaginaWebSeleccionada(paginaActualizada);
      setNombreSitioOriginal(nombreSitioEditable);
      setEnlacePaginaOriginal(enlacePaginaEditable);
      setDescripcionPaginaOriginal(descripcionPaginaEditable);
      setHayChangesPagina(false);
    }
  };

  const cancelarEdicionPaginaWeb = () => {
    setNombreSitioEditable(nombreSitioOriginal);
    setEnlacePaginaEditable(enlacePaginaOriginal);
    setDescripcionPaginaEditable(descripcionPaginaOriginal);
    setHayChangesPagina(false);
  };

  const crearCuenta = async () => {
    if (!usuario || !nombreCuentaEditable.trim() || !usuarioCuentaEditable.trim()) return;
    
    const nuevaCuenta: Cuenta = {
      id: Date.now().toString(),
      nombreCuenta: nombreCuentaEditable,
      usuario: usuarioCuentaEditable,
      contraseña: contraseñaCuentaEditable,
      fechaCreacion: new Date().toISOString(),
    };
    
    const resultado = await guardarCuenta(usuario.uid, nuevaCuenta);
    if (resultado.success) {
      const cuentaConId = { ...nuevaCuenta, id: resultado.id || nuevaCuenta.id };
      setCuentas([...cuentas, cuentaConId]);
      setCreandoCuenta(false);
      setCuentaSeleccionada(cuentaConId);
      setNombreCuentaEditable('');
      setUsuarioCuentaEditable('');
      setContraseñaCuentaEditable('');
      setHayChangesCuenta(false);
    }
  };

  const guardarEdicionCuenta = async () => {
    if (!usuario || !cuentaSeleccionada || !hayChangesCuenta) return;
    
    const cuentaActualizada = {
      ...cuentaSeleccionada,
      nombreCuenta: nombreCuentaEditable,
      usuario: usuarioCuentaEditable,
      contraseña: contraseñaCuentaEditable,
    };
    
    const resultado = await guardarCuenta(usuario.uid, cuentaActualizada);
    if (resultado.success) {
      const cuentasActualizadas = cuentas.map((c) =>
        c.id === cuentaSeleccionada.id ? cuentaActualizada : c
      );
      setCuentas(cuentasActualizadas);
      setCuentaSeleccionada(cuentaActualizada);
      setNombreCuentaOriginal(nombreCuentaEditable);
      setUsuarioCuentaOriginal(usuarioCuentaEditable);
      setContraseñaCuentaOriginal(contraseñaCuentaEditable);
      setHayChangesCuenta(false);
    }
  };

  const cancelarEdicionCuenta = () => {
    setNombreCuentaEditable(nombreCuentaOriginal);
    setUsuarioCuentaEditable(usuarioCuentaOriginal);
    setContraseñaCuentaEditable(contraseñaCuentaOriginal);
    setHayChangesCuenta(false);
  };

  const eliminarNotaLocal = async (id: string) => {
    if (!usuario) return;
    
    const resultado = await eliminarNota(usuario.uid, id);
    if (resultado.success) {
      const notasActualizadas = notas.filter((n) => n.id !== id);
      setNotas(notasActualizadas);
      if (notaSeleccionada?.id === id) {
        setNotaSeleccionada(notasActualizadas[0] || null);
      }
    }
  };

  const eliminarPaginaWebLocal = async (id: string) => {
    if (!usuario) return;
    
    const resultado = await eliminarPaginaWeb(usuario.uid, id);
    if (resultado.success) {
      setPaginasWeb(paginasWeb.filter((p) => p.id !== id));
      if (paginaWebSeleccionada?.id === id) {
        setPaginaWebSeleccionada(null);
      }
    }
  };

  const eliminarCuentaLocal = async (id: string) => {
    if (!usuario) return;
    
    const resultado = await eliminarCuenta(usuario.uid, id);
    if (resultado.success) {
      setCuentas(cuentas.filter((c) => c.id !== id));
      if (cuentaSeleccionada?.id === id) {
        setCuentaSeleccionada(null);
      }
    }
  };

  const abrirModalEliminarCategoria = (categoria: Categoria) => {
    setCategoriaAEliminar(categoria);
    setMostrarModalConfirmacion(true);
  };

  const confirmarEliminarCategoria = async () => {
    if (!usuario || !categoriaAEliminar) return;
    
    const resultado = await eliminarCategoria(usuario.uid, categoriaAEliminar.id);
    if (resultado.success) {
      setCategorias(categorias.filter((c) => c.id !== categoriaAEliminar.id));
      const notasSinCategoria = notas.filter((n) => n.categoriaId !== categoriaAEliminar.id);
      setNotas(notasSinCategoria);
      setMostrarModalConfirmacion(false);
      setCategoriaAEliminar(null);
    }
  };

  const cancelarEliminarCategoria = () => {
    setMostrarModalConfirmacion(false);
    setCategoriaAEliminar(null);
  };

  const notasPorCategoria = (categoriaId: string) => {
    return notas.filter((n) => n.categoriaId === categoriaId);
  };

  const notasPorSubcategoria = (subcategoriaId: string) => {
    return notas.filter((n) => n.subcategoriaId === subcategoriaId);
  };

  const subcategoriasPorCategoria = (categoriaId: string) => {
    return subcategorias.filter((s) => s.categoriaId === categoriaId);
  };

  const crearSubcategoria = async () => {
    if (!usuario || !nombreSubcategoria.trim() || !categoriaVistaActual) return;
    
    const nuevaSubcategoria: Subcategoria = {
      id: Date.now().toString(),
      nombre: nombreSubcategoria,
      categoriaId: categoriaVistaActual,
      color: colorSubcategoria
    };
    
    const resultado = await guardarSubcategoria(usuario.uid, nuevaSubcategoria);
    if (resultado.success) {
      const subcategoriaConId = { ...nuevaSubcategoria, id: resultado.id || nuevaSubcategoria.id };
      setSubcategorias([...subcategorias, subcategoriaConId]);
      setMostrarFormularioSubcategoria(false);
      setNombreSubcategoria('');
      setColorSubcategoria('#667eea');
    }
  };

  const eliminarSubcategoriaLocal = async (id: string) => {
    if (!usuario) return;
    
    const resultado = await eliminarSubcategoria(usuario.uid, id);
    if (resultado.success) {
      setSubcategorias(subcategorias.filter((s) => s.id !== id));
      const notasSinSubcategoria = notas.filter((n) => n.subcategoriaId !== id);
      setNotas(notasSinSubcategoria);
    }
  };

  const formatearFecha = (fecha: Date | string | undefined) => {
    if (!fecha) return 'Sin fecha';
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    if (isNaN(fechaObj.getTime())) return 'Fecha inválida';
    return fechaObj.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const claseContenedor = modoNoche ? 'contenedor-noche' : 'contenedor-dia';

  const iniciarCreacionNota = () => {
    setCreandoNota(true);
    setCreandoPagina(false);
    setCreandoCuenta(false);
    setNotaSeleccionada(null);
    setPaginaWebSeleccionada(null);
    setCuentaSeleccionada(null);
    setTituloEditable('');
    setContenidoEditable('');
    // Si hay una categoría vista actual y no es 'paginas' ni 'cuentas', usar esa categoría
    const categoriaInicial = (categoriaVistaActual && categoriaVistaActual !== 'paginas' && categoriaVistaActual !== 'cuentas') 
      ? categoriaVistaActual 
      : categorias[0]?.id || '';
    setCategoriaEditable(categoriaInicial);
    setSubcategoriaEditable(subcategoriaVistaActual || '');
    setTituloOriginal('');
    setContenidoOriginal('');
    setCategoriaOriginal('');
    setHayChanges(true);
  };

  const cancelarCreacionNota = () => {
    setCreandoNota(false);
    setTituloEditable('');
    setContenidoEditable('');
    setHayChanges(false);
  };

  const iniciarCreacionPaginaWeb = () => {
    setCreandoPagina(true);
    setCreandoNota(false);
    setCreandoCuenta(false);
    setNotaSeleccionada(null);
    setPaginaWebSeleccionada(null);
    setCuentaSeleccionada(null);
    setNombreSitioEditable('');
    setEnlacePaginaEditable('');
    setDescripcionPaginaEditable('');
    setNombreSitioOriginal('');
    setEnlacePaginaOriginal('');
    setDescripcionPaginaOriginal('');
    setHayChangesPagina(true);
  };

  const cancelarCreacionPaginaWeb = () => {
    setCreandoPagina(false);
    setNombreSitioEditable('');
    setEnlacePaginaEditable('');
    setDescripcionPaginaEditable('');
    setHayChangesPagina(false);
  };

  const iniciarCreacionCuenta = () => {
    setCreandoCuenta(true);
    setCreandoNota(false);
    setCreandoPagina(false);
    setNotaSeleccionada(null);
    setPaginaWebSeleccionada(null);
    setCuentaSeleccionada(null);
    setNombreCuentaEditable('');
    setUsuarioCuentaEditable('');
    setContraseñaCuentaEditable('');
    setNombreCuentaOriginal('');
    setUsuarioCuentaOriginal('');
    setContraseñaCuentaOriginal('');
    setHayChangesCuenta(true);
  };

  const cancelarCreacionCuenta = () => {
    setCreandoCuenta(false);
    setNombreCuentaEditable('');
    setUsuarioCuentaEditable('');
    setContraseñaCuentaEditable('');
    setHayChangesCuenta(false);
  };

  const iniciarEdicionCategoria = (categoria: Categoria) => {
    setEditandoCategoria(categoria.id);
    setNombreCategoriaEdicion(categoria.nombre);
    setColorCategoriaEdicion(categoria.color);
  };

  if (cargando) {
    return (
      <div className={`contenedor-autenticacion ${claseContenedor}`}>
        <div className="cargando">Cargando...</div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className={`contenedor-autenticacion ${claseContenedor}`}>
        {/* Botón de tema movido a la esquina superior izquierda */}
        <button
          onClick={() => setModoNoche(!modoNoche)}
          className="boton-modo-noche-autenticacion-arriba"
        >
          {modoNoche ? '☀️' : '🌙'}
        </button>

        <div className="panel-animacion">
          <div className="contenedor-login-animado">
            <div className="logo-central">
              <img src="/note.png" alt="FastNote" className="logo-principal" />
              <h1 className="titulo-principal-login">FastNote</h1>
              <p className="subtitulo-login">Tu administrador personal</p>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={indiceAnimacion}
                className="icono-flotante"
                style={{ top: posicionIcono.top, left: posicionIcono.left }}
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0, rotate: 180 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <div className="contenedor-icono-flotante">
                  <span className="emoji-flotante">
                    {elementosAnimacion[indiceAnimacion].icono}
                  </span>
                  <span className="texto-icono-flotante">
                    {elementosAnimacion[indiceAnimacion].nombre}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="panel-autenticacion">
          <div className="contenedor-formulario">
            {esRegistro ? (
              <>
                <h2 className="titulo-formulario">Crear Cuenta</h2>
                <p className="subtitulo-formulario">Completa los datos para crear tu cuenta</p>
                <form onSubmit={registrarse} className="formulario-autenticacion">
                  <div className="campo-formulario">
                    <label className="label-formulario">Correo electrónico</label>
                    <input
                      type="email"
                      placeholder="ejemplo@correo.com"
                      value={emailRegistro}
                      onChange={(e) => setEmailRegistro(e.target.value)}
                      className="entrada-autenticacion"
                      required
                    />
                  </div>
                  <div className="campo-formulario">
                    <label className="label-formulario">Contraseña</label>
                    <input
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={contraseñaRegistro}
                      onChange={(e) => setContraseñaRegistro(e.target.value)}
                      className="entrada-autenticacion"
                      required
                    />
                  </div>
                  <div className="campo-formulario">
                    <label className="label-formulario">Confirmar contraseña</label>
                    <input
                      type="password"
                      placeholder="Repite tu contraseña"
                      value={confirmarContraseña}
                      onChange={(e) => setConfirmarContraseña(e.target.value)}
                      className="entrada-autenticacion"
                      required
                    />
                  </div>
                  <button type="submit" className="boton-autenticacion">
                    Crear cuenta
                  </button>
                </form>
                {errorAuth && <p className="error-auth">{errorAuth}</p>}
                <button
                  onClick={() => {
                    setEsRegistro(false);
                    setErrorAuth('');
                  }}
                  className="boton-cambiar-formulario"
                >
                  ¿Ya tienes cuenta? Inicia sesión
                </button>
              </>
            ) : (
              <>
                <h2 className="titulo-formulario">Iniciar Sesión</h2>
                <p className="subtitulo-formulario">Ingresa tus credenciales para continuar</p>
                <form onSubmit={iniciarSesion} className="formulario-autenticacion">
                  <div className="campo-formulario">
                    <label className="label-formulario">Correo electrónico</label>
                    <input
                      type="email"
                      placeholder="ejemplo@correo.com"
                      value={emailLogin}
                      onChange={(e) => setEmailLogin(e.target.value)}
                      className="entrada-autenticacion"
                      required
                    />
                  </div>
                  <div className="campo-formulario">
                    <label className="label-formulario">Contraseña</label>
                    <input
                      type="password"
                      placeholder="Ingresa tu contraseña"
                      value={contraseñaLogin}
                      onChange={(e) => setContraseñaLogin(e.target.value)}
                      className="entrada-autenticacion"
                      required
                    />
                  </div>
                  <button type="submit" className="boton-autenticacion">
                    Iniciar sesión
                  </button>
                </form>
                {errorAuth && <p className="error-auth">{errorAuth}</p>}
                <button
                  onClick={() => {
                    setEsRegistro(true);
                    setErrorAuth('');
                  }}
                  className="boton-cambiar-formulario"
                >
                  ¿No tienes cuenta? Regístrate
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`aplicacion ${claseContenedor}`}>
      <aside className="panel-lateral">
        <div className="encabezado-panel">
          <button
            className="boton-modo-noche"
            onClick={() => setModoNoche(!modoNoche)}
            title={modoNoche ? 'Modo día' : 'Modo noche'}
          >
            {modoNoche ? '☀️' : '🌙'}
          </button>
          <div className="logo-container" onClick={() => {
            setCategoriaVistaActual(null);
            setNotaSeleccionada(null);
            setPaginaWebSeleccionada(null);
            setCuentaSeleccionada(null);
            setCreandoNota(false);
            setCreandoPagina(false);
            setCreandoCuenta(false);
          }}>
            <img src="/note.png" alt="FastNote" className="logo-app" />
            <h1 className="titulo-principal">FastNote</h1>
          </div>
        </div>



        <div className="selector-categoria-principal">
          <h3 className="titulo-seccion">Mis Notas</h3>
          <button
            className="boton-crear-categoria"
            onClick={() => setMostrarFormularioCategoria(!mostrarFormularioCategoria)}
          >
            + Nueva Categoría
          </button>
        </div>

        {mostrarFormularioCategoria && (
          <>
            <div className="overlay-modal" onClick={() => setMostrarFormularioCategoria(false)}></div>
            <div className="modal-categoria">
              <div className="encabezado-modal">
                <h3>Nueva Categoría</h3>
                <button 
                  className="boton-cerrar-modal"
                  onClick={() => setMostrarFormularioCategoria(false)}
                >
                  ×
                </button>
              </div>
              <form className="formulario-modal" onSubmit={crearCategoria}>
                <div className="campo-modal">
                  <label className="label-modal">Nombre de la categoría</label>
                  <input
                    type="text"
                    placeholder="Ej: Trabajo, Personal, Ideas..."
                    value={nombreCategoria}
                    onChange={(e) => setNombreCategoria(e.target.value)}
                    className="entrada-modal"
                    autoFocus
                  />
                </div>
                
                <div className="campo-modal">
                  <label className="label-modal">Color de la categoría</label>
                  <div className="contenedor-colorpicker">
                    <input
                      type="color"
                      value={colorCategoria}
                      onChange={(e) => setColorCategoria(e.target.value.toUpperCase())}
                      className="colorpicker-directo"
                    />
                    <span className="codigo-color">{colorCategoria}</span>
                  </div>
                </div>
                
                <div className="botones-modal">
                  <button 
                    type="button" 
                    className="boton-modal-secundario"
                    onClick={() => setMostrarFormularioCategoria(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="boton-modal-primario">
                    Crear Categoría
                  </button>
                </div>
              </form>
            </div>
          </>
        )}

        {/* Modal para crear Subcategoría */}
        {mostrarFormularioSubcategoria && (
          <>
            <div className="overlay-modal" onClick={() => setMostrarFormularioSubcategoria(false)}></div>
            <div className="modal-categoria">
              <form onSubmit={(e) => { e.preventDefault(); crearSubcategoria(); }}>
                <div className="encabezado-modal">
                  <h2>📁 Nueva Subcategoría</h2>
                  <button 
                    type="button"
                    className="boton-cerrar-modal"
                    onClick={() => setMostrarFormularioSubcategoria(false)}
                  >
                    ×
                  </button>
                </div>
                
                <div className="campo-modal">
                  <label className="label-modal">Nombre de la subcategoría</label>
                  <input
                    type="text"
                    placeholder="Ej: Proyectos, Reuniones..."
                    value={nombreSubcategoria}
                    onChange={(e) => setNombreSubcategoria(e.target.value)}
                    className="input-modal"
                    autoFocus
                  />
                </div>
                
                <div className="campo-modal">
                  <label className="label-modal">Color de la subcategoría</label>
                  <div className="contenedor-colorpicker">
                    <input
                      type="color"
                      value={colorSubcategoria}
                      onChange={(e) => setColorSubcategoria(e.target.value.toUpperCase())}
                      className="colorpicker-directo"
                    />
                    <span className="codigo-color">{colorSubcategoria}</span>
                  </div>
                </div>
                
                <div className="botones-modal">
                  <button 
                    type="button" 
                    className="boton-modal-secundario"
                    onClick={() => setMostrarFormularioSubcategoria(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="boton-modal-primario">
                    Crear Subcategoría
                  </button>
                </div>
              </form>
            </div>
          </>
        )}

        <div className="lista-categorias">
          {categorias.map((categoria) => (
            <div 
              key={categoria.id} 
              className={`item-categoria ${categoriaVistaActual === categoria.id ? 'seleccionada' : ''}`}
              onClick={() => {
                setCategoriaVistaActual(categoria.id);
                setNotaSeleccionada(null);
                setPaginaWebSeleccionada(null);
                setCuentaSeleccionada(null);
                setCreandoNota(false);
                setCreandoPagina(false);
                setCreandoCuenta(false);
              }}
            >
              <div className="contenido-categoria">
                <div className="info-categoria">
                  <div className="circulo-color" style={{ backgroundColor: categoria.color }} />
                  {editandoCategoria === categoria.id ? (
                    <input
                      type="text"
                      value={nombreCategoriaEdicion}
                      onChange={(e) => setNombreCategoriaEdicion(e.target.value)}
                      className="entrada-edicion-categoria-inline"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          guardarEdicionCategoria();
                        } else if (e.key === 'Escape') {
                          setEditandoCategoria(null);
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <h3 className="nombre-categoria">{categoria.nombre}</h3>
                  )}
                </div>
                <span className="contador-notas">{notasPorCategoria(categoria.id).length}</span>
              </div>
              <div className="botones-categoria">
                {editandoCategoria !== categoria.id ? (
                  <>
                    <button
                      className="boton-editar-categoria"
                      onClick={(e) => {
                        e.stopPropagation();
                        iniciarEdicionCategoria(categoria);
                      }}
                      title="Editar"
                    >
                      ✎
                    </button>
                    <button
                      className="boton-eliminar-categoria"
                      onClick={(e) => {
                        e.stopPropagation();
                        abrirModalEliminarCategoria(categoria);
                      }}
                      title="Eliminar"
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="boton-guardar-pequeño"
                      onClick={(e) => {
                        e.stopPropagation();
                        guardarEdicionCategoria();
                      }}
                    >
                      ✓
                    </button>
                    <button
                      className="boton-cancelar-pequeño"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditandoCategoria(null);
                      }}
                    >
                      ×
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="divisor-categorias"></div>

        <h3 className="titulo-seccion">Otros</h3>

        <div 
          className={`item-categoria ${categoriaVistaActual === 'paginas' ? 'seleccionada' : ''}`}
          onClick={() => {
            setCategoriaVistaActual('paginas');
            setNotaSeleccionada(null);
            setPaginaWebSeleccionada(null);
            setCuentaSeleccionada(null);
            setCreandoNota(false);
            setCreandoPagina(false);
            setCreandoCuenta(false);
          }}
        >
          <div className="contenido-categoria">
            <div className="info-categoria">
              <div className="circulo-color" style={{ backgroundColor: '#95E1D3' }} />
              <h3 className="nombre-categoria">Páginas Web</h3>
            </div>
            <span className="contador-notas">{paginasWeb.length}</span>
          </div>
          <button
            className="boton-agregar-mini"
            onClick={(e) => {
              e.stopPropagation();
              iniciarCreacionPaginaWeb();
            }}
            title="Agregar página web"
          >
            +
          </button>
        </div>

        <div 
          className={`item-categoria ${categoriaVistaActual === 'cuentas' ? 'seleccionada' : ''}`}
          onClick={() => {
            setCategoriaVistaActual('cuentas');
            setNotaSeleccionada(null);
            setPaginaWebSeleccionada(null);
            setCuentaSeleccionada(null);
            setCreandoNota(false);
            setCreandoPagina(false);
            setCreandoCuenta(false);
          }}
        >
          <div className="contenido-categoria">
            <div className="info-categoria">
              <div className="circulo-color" style={{ backgroundColor: '#FF6B9D' }} />
              <h3 className="nombre-categoria">Cuentas</h3>
            </div>
            <span className="contador-notas">{cuentas.length}</span>
          </div>
          <button
            className="boton-agregar-mini"
            onClick={(e) => {
              e.stopPropagation();
              iniciarCreacionCuenta();
            }}
            title="Agregar cuenta"
          >
            +
          </button>
        </div>

        <div className="seccion-acciones-panel">
          <button
            className="boton-configuracion-lateral"
            onClick={() => setMostrarModalConfiguracion(true)}
          >
            ⚙️ Configuración
          </button>

          <button
            className="boton-cerrar-sesion-lateral"
            onClick={cerrarSesion}
          >
            Cerrar sesión
          </button>
        </div>

        {/* Modal de Configuración */}
        {mostrarModalConfiguracion && (
          <div className="overlay-modal" onClick={() => setMostrarModalConfiguracion(false)}>
            <div className="modal-configuracion" onClick={(e) => e.stopPropagation()}>
              <div className="encabezado-modal">
                <h2>⚙️ Configuración</h2>
                <button 
                  className="boton-cerrar-modal"
                  onClick={() => setMostrarModalConfiguracion(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="contenido-modal-config">
                <p className="descripcion-modal">Administra tu cuenta y datos</p>
                
                <div className="seccion-opciones-modal">
                  <button
                    className="opcion-config"
                    onClick={exportarDatos}
                  >
                    <span className="icono-opcion">💾</span>
                    <div className="texto-opcion">
                      <strong>Descargar backup</strong>
                      <small>Exporta todas tus notas y datos</small>
                    </div>
                  </button>
                  
                  <button
                    className="opcion-config peligrosa"
                    onClick={eliminarTodasLasNotas}
                  >
                    <span className="icono-opcion">🗑️</span>
                    <div className="texto-opcion">
                      <strong>Eliminar todas las notas</strong>
                      <small>Esta acción no se puede deshacer</small>
                    </div>
                  </button>
                </div>
              </div>
              
              <div className="pie-modal">
                <button 
                  className="boton-modal-secundario"
                  onClick={() => setMostrarModalConfiguracion(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmación para Eliminar Categoría */}
        {mostrarModalConfirmacion && categoriaAEliminar && (
          <div className="overlay-modal" onClick={cancelarEliminarCategoria}>
            <div className="modal-confirmacion" onClick={(e) => e.stopPropagation()}>
              <div className="encabezado-modal">
                <h2>⚠️ Confirmar eliminación</h2>
                <button 
                  className="boton-cerrar-modal"
                  onClick={cancelarEliminarCategoria}
                >
                  ×
                </button>
              </div>
              
              <div className="contenido-modal-confirmacion">
                <div className="mensaje-advertencia">
                  <p className="texto-principal">
                    ¿Estás seguro de que deseas eliminar la categoría <strong>"{categoriaAEliminar.nombre}"</strong>?
                  </p>
                  <p className="texto-secundario">
                    Esta acción eliminará la categoría y todas las notas asociadas ({notasPorCategoria(categoriaAEliminar.id).length} nota{notasPorCategoria(categoriaAEliminar.id).length !== 1 ? 's' : ''}).
                  </p>
                  <p className="texto-advertencia">
                    Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
              
              <div className="pie-modal">
                <button 
                  className="boton-modal-secundario"
                  onClick={cancelarEliminarCategoria}
                >
                  Cancelar
                </button>
                <button 
                  className="boton-modal-peligroso"
                  onClick={confirmarEliminarCategoria}
                >
                  Eliminar categoría
                </button>
              </div>
            </div>
          </div>
        )}

      </aside>

      <main className="area-principal">
        <div className="encabezado-principal">
          <h2>Editor de Notas</h2>
          <button
            className="boton-crear-nota"
            onClick={iniciarCreacionNota}
          >
            + Nueva Nota
          </button>
        </div>

        {categoriaVistaActual && !subcategoriaVistaActual && !creandoNota && !creandoPagina && !creandoCuenta && !notaSeleccionada && !paginaWebSeleccionada && !cuentaSeleccionada && (
          <div className="vista-navegacion-notas">
            <div className="encabezado-vista-categoria">
              <div className="breadcrumb">
                <span className="breadcrumb-item" onClick={() => {
                  setCategoriaVistaActual(null);
                  setSubcategoriaVistaActual(null);
                }}>🏠 Inicio</span>
                <span className="breadcrumb-separator">›</span>
                <span className="breadcrumb-item activo">
                  {categoriaVistaActual === 'paginas' ? 'Páginas Web' : 
                   categoriaVistaActual === 'cuentas' ? 'Cuentas' : 
                   categorias.find(c => c.id === categoriaVistaActual)?.nombre || 'Sin categoría'}
                </span>
              </div>
              {categoriaVistaActual !== 'paginas' && categoriaVistaActual !== 'cuentas' && (
                <button
                  className="boton-crear-subcategoria"
                  onClick={() => setMostrarFormularioSubcategoria(true)}
                >
                  + Nueva Subcategoría
                </button>
              )}
            </div>
            <div className="grid-notas-vista">
              {categoriaVistaActual === 'paginas' ? (
                paginasWeb.length > 0 ? (
                  paginasWeb.map((pagina) => (
                    <div
                      key={pagina.id}
                      className="card-nota"
                      onClick={() => {
                        setPaginaWebSeleccionada(pagina);
                        setNotaSeleccionada(null);
                        setCuentaSeleccionada(null);
                      }}
                    >
                      <h4>{pagina.nombreSitio}</h4>
                      <p className="preview-contenido">{pagina.enlace}</p>
                    </div>
                  ))
                ) : (
                  <div className="estado-vacio">
                    <span className="icono-vacio">🌐</span>
                    <h3>Sin Páginas Web aún</h3>
                    <p>Crea nuevas páginas web para organizarlas</p>
                  </div>
                )
              ) : categoriaVistaActual === 'cuentas' ? (
                cuentas.length > 0 ? (
                  cuentas.map((cuenta) => (
                    <div
                      key={cuenta.id}
                      className="card-nota"
                      onClick={() => {
                        setCuentaSeleccionada(cuenta);
                        setNotaSeleccionada(null);
                        setPaginaWebSeleccionada(null);
                      }}
                    >
                      <h4>{cuenta.nombreCuenta}</h4>
                      <p className="preview-contenido">{cuenta.usuario}</p>
                    </div>
                  ))
                ) : (
                  <div className="estado-vacio">
                    <span className="icono-vacio">🔐</span>
                    <h3>Sin Cuentas aún</h3>
                    <p>Crea nuevas cuentas para gestionarlas de forma segura</p>
                  </div>
                )
              ) : (
                <>
                  {/* Mostrar subcategorías primero */}
                  {subcategoriasPorCategoria(categoriaVistaActual).map((subcategoria) => (
                    <div
                      key={subcategoria.id}
                      className="card-subcategoria"
                      onClick={() => setSubcategoriaVistaActual(subcategoria.id)}
                    >
                      <div className="icono-carpeta" style={{ color: subcategoria.color }}>📁</div>
                      <h4>{subcategoria.nombre}</h4>
                      <p className="contador-items">{notasPorSubcategoria(subcategoria.id).length} notas</p>
                    </div>
                  ))}
                  
                  {/* Mostrar notas sin subcategoría */}
                  {notasPorCategoria(categoriaVistaActual).filter(n => !n.subcategoriaId).length > 0 ? (
                    notasPorCategoria(categoriaVistaActual).filter(n => !n.subcategoriaId).map((nota) => (
                      <div
                        key={nota.id}
                        className="card-nota"
                        onClick={() => {
                          setNotaSeleccionada(nota);
                          setPaginaWebSeleccionada(null);
                          setCuentaSeleccionada(null);
                        }}
                      >
                        <h4>{nota.titulo}</h4>
                        <p className="preview-contenido">{nota.contenido}</p>
                        <span className="fecha-card">{formatearFecha(nota.fechaCreacion)}</span>
                      </div>
                    ))
                  ) : subcategoriasPorCategoria(categoriaVistaActual).length === 0 && (
                    <div className="estado-vacio">
                      <span className="icono-vacio">📝</span>
                      <h3>Sin Notas aún</h3>
                      <p>Crea unas nuevas para comenzar a organizar tus ideas</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Vista de Subcategoría */}
        {subcategoriaVistaActual && !creandoNota && !notaSeleccionada && (
          <div className="vista-navegacion-notas">
            <div className="encabezado-vista-categoria">
              <div className="breadcrumb">
                <span className="breadcrumb-item" onClick={() => {
                  setCategoriaVistaActual(null);
                  setSubcategoriaVistaActual(null);
                }}>🏠 Inicio</span>
                <span className="breadcrumb-separator">›</span>
                <span className="breadcrumb-item" onClick={() => setSubcategoriaVistaActual(null)}>
                  {categorias.find(c => c.id === categoriaVistaActual)?.nombre || 'Categoría'}
                </span>
                <span className="breadcrumb-separator">›</span>
                <span className="breadcrumb-item activo">
                  {subcategorias.find(s => s.id === subcategoriaVistaActual)?.nombre || 'Subcategoría'}
                </span>
              </div>
            </div>
            <div className="grid-notas-vista">
              {notasPorSubcategoria(subcategoriaVistaActual).length > 0 ? (
                notasPorSubcategoria(subcategoriaVistaActual).map((nota) => (
                  <div
                    key={nota.id}
                    className="card-nota"
                    onClick={() => {
                      setNotaSeleccionada(nota);
                      setPaginaWebSeleccionada(null);
                      setCuentaSeleccionada(null);
                    }}
                  >
                    <h4>{nota.titulo}</h4>
                    <p className="preview-contenido">{nota.contenido}</p>
                    <span className="fecha-card">{formatearFecha(nota.fechaCreacion)}</span>
                  </div>
                ))
              ) : (
                <div className="estado-vacio">
                  <span className="icono-vacio">📝</span>
                  <h3>Sin Notas aún</h3>
                  <p>Crea unas nuevas en esta subcategoría</p>
                </div>
              )}
            </div>
          </div>
        )}

        {creandoNota && (
          <div className="visor-nota">
            <div className="seccion-encabezado-nota">
              <div className="informacion-nota">
                <input
                  type="text"
                  placeholder="Título de la nota"
                  value={tituloEditable}
                  onChange={(e) => setTituloEditable(e.target.value)}
                  className="titulo-editable"
                />
                <div className="meta-datos">
                  <select
                    value={categoriaEditable}
                    onChange={(e) => setCategoriaEditable(e.target.value)}
                    className="categoria-editable"
                    style={{
                      backgroundColor: categorias.find(c => c.id === categoriaEditable)?.color,
                      color: '#fff',
                    }}
                  >
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                  <span className="separador">•</span>
                  <span className="fecha-visor">Creando nueva nota</span>
                </div>
              </div>
              <div className="botones-acciones">
                <button
                  className="boton-guardar"
                  onClick={crearNota}
                  disabled={!tituloEditable.trim()}
                >
                  Guardar Nota
                </button>
                <button
                  className="boton-cancelar"
                  onClick={cancelarCreacionNota}
                >
                  Cancelar
                </button>
              </div>
            </div>

            <div className="linea-separadora"></div>

            <textarea
              value={contenidoEditable}
              onChange={(e) => setContenidoEditable(e.target.value)}
              placeholder="Escribe tu nota aquí..."
              className="contenido-editable-textarea"
            />
          </div>
        )}

        {notaSeleccionada && !creandoNota && (
          <div className="visor-nota">
            <div className="seccion-encabezado-nota">
              <div className="informacion-nota">
                <input
                  type="text"
                  value={tituloEditable}
                  onChange={(e) => setTituloEditable(e.target.value)}
                  className="titulo-editable"
                />
                <div className="meta-datos">
                  <select
                    value={categoriaEditable}
                    onChange={(e) => setCategoriaEditable(e.target.value)}
                    className="categoria-editable"
                    style={{
                      backgroundColor: categorias.find(c => c.id === categoriaEditable)?.color,
                      color: '#fff',
                    }}
                  >
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                  <span className="separador">•</span>
                  <span className="fecha-visor">
                    {formatearFecha(notaSeleccionada.fechaCreacion)}
                  </span>
                </div>
              </div>
              <div className="botones-acciones">
                {hayChanges ? (
                  <>
                    <button
                      className="boton-guardar"
                      onClick={guardarEdicionNota}
                    >
                      Guardar Cambios
                    </button>
                    <button
                      className="boton-cancelar"
                      onClick={cancelarEdicionNota}
                    >
                      Descartar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="boton-editar-nota"
                      title="Editar nota"
                    >
                      Editar
                    </button>
                    <button
                      className="boton-eliminar-nota"
                      onClick={() => eliminarNotaLocal(notaSeleccionada.id)}
                      title="Eliminar nota"
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="linea-separadora"></div>

            <textarea
              value={contenidoEditable}
              onChange={(e) => setContenidoEditable(e.target.value)}
              className="contenido-editable-textarea"
            />
          </div>
        )}

        {creandoPagina && (
          <div className="visor-nota">
            <div className="seccion-encabezado-nota">
              <div className="informacion-nota">
                <input
                  type="text"
                  placeholder="Nombre del sitio"
                  value={nombreSitioEditable}
                  onChange={(e) => setNombreSitioEditable(e.target.value)}
                  className="titulo-editable"
                />
                <div className="meta-datos">
                  <span
                    className="categoria-visor"
                    style={{
                      backgroundColor: '#95E1D3',
                      color: '#333',
                    }}
                  >
                    Página Web
                  </span>
                  <span className="separador">•</span>
                  <span className="fecha-visor">Creando nueva página</span>
                </div>
              </div>
              <div className="botones-acciones">
                <button
                  className="boton-guardar"
                  onClick={crearPaginaWeb}
                  disabled={!nombreSitioEditable.trim() || !enlacePaginaEditable.trim()}
                >
                  Guardar Página Web
                </button>
                <button
                  className="boton-cancelar"
                  onClick={cancelarCreacionPaginaWeb}
                >
                  Cancelar
                </button>
              </div>
            </div>

            <div className="linea-separadora"></div>

            <div className="contenedor-pagina-web">
              <div className="seccion-pagina-web">
                <h3 className="etiqueta-pagina">Enlace</h3>
                <div className="grupo-con-copiar">
                  <input
                    type="url"
                    placeholder="https://ejemplo.com"
                    value={enlacePaginaEditable}
                    onChange={(e) => setEnlacePaginaEditable(e.target.value)}
                    className="enlace-editable"
                  />
                  <button
                    type="button"
                    className="boton-copiar"
                    onClick={() => copiarAlPortapapeles(enlacePaginaEditable, 'enlace')}
                  >
                    {notificacionCopiar === 'enlace' ? '✓' : 'Copiar'}
                  </button>
                </div>
              </div>

              <div className="seccion-pagina-web">
                <h3 className="etiqueta-pagina">Descripción</h3>
                <textarea
                  placeholder="Descripción de la página web..."
                  value={descripcionPaginaEditable}
                  onChange={(e) => setDescripcionPaginaEditable(e.target.value)}
                  className="descripcion-editable"
                />
              </div>
            </div>
          </div>
        )}

        {paginaWebSeleccionada && !creandoPagina && (
          <div className="visor-nota">
            <div className="seccion-encabezado-nota">
              <div className="informacion-nota">
                <input
                  type="text"
                  value={nombreSitioEditable}
                  onChange={(e) => setNombreSitioEditable(e.target.value)}
                  className="titulo-editable"
                />
                <div className="meta-datos">
                  <span
                    className="categoria-visor"
                    style={{
                      backgroundColor: '#95E1D3',
                      color: '#333',
                    }}
                  >
                    Página Web
                  </span>
                  <span className="separador">•</span>
                  <span className="fecha-visor">
                    {formatearFecha(paginaWebSeleccionada.fechaCreacion)}
                  </span>
                </div>
              </div>
              <div className="botones-acciones">
                {hayChangesPagina ? (
                  <>
                    <button
                      className="boton-guardar"
                      onClick={guardarEdicionPaginaWeb}
                    >
                      Guardar Cambios
                    </button>
                    <button
                      className="boton-cancelar"
                      onClick={cancelarEdicionPaginaWeb}
                    >
                      Descartar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="boton-editar-nota"
                      title="Editar"
                    >
                      Editar
                    </button>
                    <button
                      className="boton-eliminar-nota"
                      onClick={() => eliminarPaginaWebLocal(paginaWebSeleccionada.id)}
                      title="Eliminar página"
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="linea-separadora"></div>

            <div className="contenedor-pagina-web">
              <div className="seccion-pagina-web">
                <h3 className="etiqueta-pagina">Enlace</h3>
                <div className="grupo-con-copiar">
                  <input
                    type="url"
                    value={enlacePaginaEditable}
                    onChange={(e) => setEnlacePaginaEditable(e.target.value)}
                    className="enlace-editable"
                  />
                  <button
                    type="button"
                    className="boton-copiar"
                    onClick={() => copiarAlPortapapeles(enlacePaginaEditable, 'enlace')}
                  >
                    {notificacionCopiar === 'enlace' ? '✓' : 'Copiar'}
                  </button>
                </div>
              </div>

              <div className="seccion-pagina-web">
                <h3 className="etiqueta-pagina">Descripción</h3>
                <textarea
                  value={descripcionPaginaEditable}
                  onChange={(e) => setDescripcionPaginaEditable(e.target.value)}
                  className="descripcion-editable"
                />
              </div>
            </div>
          </div>
        )}

        {creandoCuenta && (
          <div className="visor-nota">
            <div className="seccion-encabezado-nota">
              <div className="informacion-nota">
                <input
                  type="text"
                  placeholder="Nombre de la cuenta (ej: Google)"
                  value={nombreCuentaEditable}
                  onChange={(e) => setNombreCuentaEditable(e.target.value)}
                  className="titulo-editable"
                />
                <div className="meta-datos">
                  <span
                    className="categoria-visor"
                    style={{
                      backgroundColor: '#FF6B9D',
                      color: '#fff',
                    }}
                  >
                    Cuenta
                  </span>
                  <span className="separador">•</span>
                  <span className="fecha-visor">Creando nueva cuenta</span>
                </div>
              </div>
              <div className="botones-acciones">
                <button
                  className="boton-guardar"
                  onClick={crearCuenta}
                  disabled={!nombreCuentaEditable.trim() || !usuarioCuentaEditable.trim()}
                >
                  Guardar Cuenta
                </button>
                <button
                  className="boton-cancelar"
                  onClick={cancelarCreacionCuenta}
                >
                  Cancelar
                </button>
              </div>
            </div>

            <div className="linea-separadora"></div>

            <div className="contenedor-pagina-web">
              <div className="seccion-pagina-web">
                <h3 className="etiqueta-pagina">Usuario</h3>
                <div className="grupo-con-copiar">
                  <input
                    type="text"
                    placeholder="Tu usuario o correo"
                    value={usuarioCuentaEditable}
                    onChange={(e) => setUsuarioCuentaEditable(e.target.value)}
                    className="enlace-editable"
                  />
                  <button
                    type="button"
                    className="boton-copiar"
                    onClick={() => copiarAlPortapapeles(usuarioCuentaEditable, 'usuario')}
                  >
                    {notificacionCopiar === 'usuario' ? '✓' : 'Copiar'}
                  </button>
                </div>
              </div>

              <div className="seccion-pagina-web">
                <h3 className="etiqueta-pagina">Contraseña</h3>
                <div className="grupo-contraseña">
                  <input
                    type={mostrarContraseña ? "text" : "password"}
                    placeholder="Tu contraseña"
                    value={contraseñaCuentaEditable}
                    onChange={(e) => setContraseñaCuentaEditable(e.target.value)}
                    className="enlace-editable"
                  />
                  <button
                    type="button"
                    className="boton-ver-contraseña"
                    onClick={() => setMostrarContraseña(!mostrarContraseña)}
                  >
                    {mostrarContraseña ? '👁️' : '👁️‍🗨️'}
                  </button>
                  <button
                    type="button"
                    className="boton-generar-contraseña"
                    onClick={generarContraseña}
                  >
                    Generar
                  </button>
                  <button
                    type="button"
                    className="boton-copiar"
                    onClick={() => copiarAlPortapapeles(contraseñaCuentaEditable, 'contraseña')}
                  >
                    {notificacionCopiar === 'contraseña' ? '✓' : 'Copiar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {cuentaSeleccionada && !creandoCuenta && (
          <div className="visor-nota">
            <div className="seccion-encabezado-nota">
              <div className="informacion-nota">
                <input
                  type="text"
                  value={nombreCuentaEditable}
                  onChange={(e) => setNombreCuentaEditable(e.target.value)}
                  className="titulo-editable"
                />
                <div className="meta-datos">
                  <span
                    className="categoria-visor"
                    style={{
                      backgroundColor: '#FF6B9D',
                      color: '#fff',
                    }}
                  >
                    Cuenta
                  </span>
                  <span className="separador">•</span>
                  <span className="fecha-visor">
                    {formatearFecha(cuentaSeleccionada.fechaCreacion)}
                  </span>
                </div>
              </div>
              <div className="botones-acciones">
                {hayChangesCuenta ? (
                  <>
                    <button
                      className="boton-guardar"
                      onClick={guardarEdicionCuenta}
                    >
                      Guardar Cambios
                    </button>
                    <button
                      className="boton-cancelar"
                      onClick={cancelarEdicionCuenta}
                    >
                      Descartar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="boton-editar-nota"
                      title="Editar"
                    >
                      Editar
                    </button>
                    <button
                      className="boton-eliminar-nota"
                      onClick={() => eliminarCuentaLocal(cuentaSeleccionada.id)}
                      title="Eliminar cuenta"
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="linea-separadora"></div>

            <div className="contenedor-pagina-web">
              <div className="seccion-pagina-web">
                <h3 className="etiqueta-pagina">Usuario</h3>
                <div className="grupo-con-copiar">
                  <input
                    type="text"
                    value={usuarioCuentaEditable}
                    onChange={(e) => setUsuarioCuentaEditable(e.target.value)}
                    className="enlace-editable"
                  />
                  <button
                    type="button"
                    className="boton-copiar"
                    onClick={() => copiarAlPortapapeles(usuarioCuentaEditable, 'usuario')}
                  >
                    {notificacionCopiar === 'usuario' ? '✓' : 'Copiar'}
                  </button>
                </div>
              </div>

              <div className="seccion-pagina-web">
                <h3 className="etiqueta-pagina">Contraseña</h3>
                <div className="grupo-contraseña">
                  <input
                    type="text"
                    value={contraseñaCuentaEditable}
                    onChange={(e) => setContraseñaCuentaEditable(e.target.value)}
                    className="enlace-editable"
                  />
                  <button
                    type="button"
                    className="boton-generar-contraseña"
                    onClick={generarContraseña}
                  >
                    Generar
                  </button>
                  <button
                    type="button"
                    className="boton-copiar"
                    onClick={() => copiarAlPortapapeles(contraseñaCuentaEditable, 'contraseña')}
                  >
                    {notificacionCopiar === 'contraseña' ? '✓' : 'Copiar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!notaSeleccionada && !paginaWebSeleccionada && !cuentaSeleccionada && !creandoNota && !creandoPagina && !creandoCuenta && !categoriaVistaActual && (
          <div className="vacio">
            <p className="mensaje-vacio">Selecciona una categoría para ver tus notas</p>
          </div>
        )}
      </main>
    </div>
  );
}
