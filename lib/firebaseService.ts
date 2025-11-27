import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  User
} from "firebase/auth";
import { 
  ref, 
  set, 
  get, 
  push, 
  update, 
  remove,
  onValue,
  off
} from "firebase/database";
import { auth, database } from "./firebase";

export const registrarUsuario = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const iniciarSesionUsuario = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const cerrarSesionUsuario = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const guardarNota = async (userId: string, nota: any) => {
  try {
    const notaRef = nota.id 
      ? ref(database, `usuarios/${userId}/notas/${nota.id}`)
      : push(ref(database, `usuarios/${userId}/notas`));
    
    const notaData = {
      ...nota,
      id: nota.id || notaRef.key,
      fechaCreacion: nota.fechaCreacion || new Date().toISOString()
    };
    
    await set(notaRef, notaData);
    return { success: true, id: notaData.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const obtenerNotas = async (userId: string) => {
  try {
    const notasRef = ref(database, `usuarios/${userId}/notas`);
    const snapshot = await get(notasRef);
    
    if (snapshot.exists()) {
      const notasObj = snapshot.val();
      const notasArray = Object.keys(notasObj).map(key => ({
        ...notasObj[key],
        id: key
      }));
      return { success: true, notas: notasArray };
    }
    return { success: true, notas: [] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const eliminarNota = async (userId: string, notaId: string) => {
  try {
    await remove(ref(database, `usuarios/${userId}/notas/${notaId}`));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const guardarPaginaWeb = async (userId: string, pagina: any) => {
  try {
    const paginaRef = pagina.id 
      ? ref(database, `usuarios/${userId}/paginasWeb/${pagina.id}`)
      : push(ref(database, `usuarios/${userId}/paginasWeb`));
    
    const paginaData = {
      ...pagina,
      id: pagina.id || paginaRef.key,
      fechaCreacion: pagina.fechaCreacion || new Date().toISOString()
    };
    
    await set(paginaRef, paginaData);
    return { success: true, id: paginaData.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const obtenerPaginasWeb = async (userId: string) => {
  try {
    const paginasRef = ref(database, `usuarios/${userId}/paginasWeb`);
    const snapshot = await get(paginasRef);
    
    if (snapshot.exists()) {
      const paginasObj = snapshot.val();
      const paginasArray = Object.keys(paginasObj).map(key => ({
        ...paginasObj[key],
        id: key
      }));
      return { success: true, paginas: paginasArray };
    }
    return { success: true, paginas: [] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const eliminarPaginaWeb = async (userId: string, paginaId: string) => {
  try {
    await remove(ref(database, `usuarios/${userId}/paginasWeb/${paginaId}`));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const guardarCuenta = async (userId: string, cuenta: any) => {
  try {
    const cuentaRef = cuenta.id 
      ? ref(database, `usuarios/${userId}/cuentas/${cuenta.id}`)
      : push(ref(database, `usuarios/${userId}/cuentas`));
    
    const cuentaData = {
      ...cuenta,
      id: cuenta.id || cuentaRef.key,
      fechaCreacion: cuenta.fechaCreacion || new Date().toISOString()
    };
    
    await set(cuentaRef, cuentaData);
    return { success: true, id: cuentaData.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const obtenerCuentas = async (userId: string) => {
  try {
    const cuentasRef = ref(database, `usuarios/${userId}/cuentas`);
    const snapshot = await get(cuentasRef);
    
    if (snapshot.exists()) {
      const cuentasObj = snapshot.val();
      const cuentasArray = Object.keys(cuentasObj).map(key => ({
        ...cuentasObj[key],
        id: key
      }));
      return { success: true, cuentas: cuentasArray };
    }
    return { success: true, cuentas: [] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const eliminarCuenta = async (userId: string, cuentaId: string) => {
  try {
    await remove(ref(database, `usuarios/${userId}/cuentas/${cuentaId}`));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const guardarCategoria = async (userId: string, categoria: any) => {
  try {
    const categoriaRef = categoria.id 
      ? ref(database, `usuarios/${userId}/categorias/${categoria.id}`)
      : push(ref(database, `usuarios/${userId}/categorias`));
    
    const categoriaData = {
      ...categoria,
      id: categoria.id || categoriaRef.key
    };
    
    await set(categoriaRef, categoriaData);
    return { success: true, id: categoriaData.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const obtenerCategorias = async (userId: string) => {
  try {
    const categoriasRef = ref(database, `usuarios/${userId}/categorias`);
    const snapshot = await get(categoriasRef);
    
    if (snapshot.exists()) {
      const categoriasObj = snapshot.val();
      const categoriasArray = Object.keys(categoriasObj).map(key => ({
        ...categoriasObj[key],
        id: key
      }));
      return { success: true, categorias: categoriasArray };
    }
    return { success: true, categorias: [] };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const eliminarCategoria = async (userId: string, categoriaId: string) => {
  try {
    await remove(ref(database, `usuarios/${userId}/categorias/${categoriaId}`));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const eliminarTodasLasNotas = async (userId: string) => {
  try {
    await remove(ref(database, `usuarios/${userId}/notas`));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const escucharCambiosNotas = (userId: string, callback: (notas: any[]) => void) => {
  const notasRef = ref(database, `usuarios/${userId}/notas`);
  onValue(notasRef, (snapshot) => {
    if (snapshot.exists()) {
      const notasObj = snapshot.val();
      const notasArray = Object.keys(notasObj).map(key => ({
        ...notasObj[key],
        id: key
      }));
      callback(notasArray);
    } else {
      callback([]);
    }
  });
  return () => off(notasRef);
};
