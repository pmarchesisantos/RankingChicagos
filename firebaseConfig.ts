// #############################################################################
// #                                                                           #
// #                           !! AVISO DE SEGURANÇA !!                         #
// #                                                                           #
// # As suas credenciais do Firebase estão visíveis publicamente neste        #
// # arquivo. Isso é normal para aplicações web, mas exige uma medida de       #
// # segurança CRÍTICA para evitar abusos.                                     #
// #                                                                           #
// # Para proteger sua aplicação em produção, é ESSENCIAL que você configure   #
// # os "Domínios autorizados" no seu console do Firebase.                     #
// #                                                                           #
// # 1. Vá para o Console do Firebase -> Authentication -> Settings ->         #
// #    Authorized domains.                                                    #
// # 2. Adicione o domínio exato onde sua aplicação está hospedada (ex:        #
// #    meu-ranking.vercel.app, www.meusite.com).                              #
// #                                                                           #
// # Isso garantirá que somente seu site possa usar estas credenciais,         #
// # bloqueando tentativas de acesso de outros domínios.                       #
// #                                                                           #
// #############################################################################


// IMPORTANTE: Substitua os valores abaixo pelos valores do seu projeto no Firebase.
// Você pode encontrá-los no Console do Firebase > Configurações do Projeto.

// FIX: The `firebase/compat/app` module has a default export which is needed for initialization. Changed from namespace import to default import.
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";

const firebaseConfig = {
  apiKey: "AIzaSyD2Nbg-CKJROqKiAZ1ymeEdI1Unc2BUXss",
  authDomain: "ranking-semanal-app.firebaseapp.com",
  databaseURL: "https://ranking-semanal-app-default-rtdb.firebaseio.com",
  projectId: "ranking-semanal-app",
  storageBucket: "ranking-semanal-app.firebasestorage.app",
  messagingSenderId: "694680432892",
  appId: "1:694680432892:web:3bb11aa91a4c459f06e779"
};

// Inicializa o Firebase e exporta as instâncias dos serviços.
let auth, db;

try {
  // Garante que o Firebase não seja inicializado mais de uma vez.
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  
  auth = firebase.auth();
  db = firebase.database();
} catch (error: any) {
  console.error("## FALHA CRÍTICA NA INICIALIZAÇÃO DO FIREBASE ##");
  console.error("Ocorreu um erro que impediu a conexão com o banco de dados. Verifique as credenciais e as regras de segurança.");
  console.error("Detalhes do erro:", error.message || error);
  // Se a inicialização falhar, as exportações `auth` e `db` serão `undefined`,
  // e a aplicação tratará de exibir uma mensagem de erro para o usuário.
}

// Export the firebase namespace object itself for type usage in other files.
export { firebase, auth, db };