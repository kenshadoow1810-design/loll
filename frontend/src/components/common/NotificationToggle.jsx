import { usePushNotifications } from '../hooks/usePushNotifications';

export function NotificationToggle() {
  const {
    isSupported,
    subscription,
    permission,
    loading,
    error,
    subscribeToPush,
    unsubscribe,
    testLocalNotification
  } = usePushNotifications();

  const handleSubscribe = async () => {
    try {
      await subscribeToPush();
      alert('Notificações ativadas com sucesso! Você será notificado sobre partidas próximas.');
    } catch (err) {

      alert('Erro ao ativar notificações: ' + err.message);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      await unsubscribe();
      alert('Notificações desativadas.');
    } catch (err) {

      alert('Erro ao desativar notificações: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="notification-toggle">
        <p>Carregando notificações...</p>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="notification-toggle unsupported">
        <p>❌ Notificações não suportadas no seu navegador</p>
        <p className="text-sm text-gray-500">Use Chrome, Firefox ou Edge para receber notificações</p>
      </div>
    );
  }

  return (
    <div className="notification-toggle p-4 bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">
          🔔 Notificações de Partidas
        </h3>
        {subscription && (
          <span className="px-2 py-1 text-xs bg-green-600 text-white rounded-full">
            Ativo
          </span>
        )}
      </div>

      <p className="text-gray-300 text-sm mb-4">
        Receba notificações {permission === 'granted' ? 'antes das partidas começarem!' : 'quando as partidas estiverem para começar.'}
      </p>

      {error && (
        <p className="text-red-400 text-sm mb-3 bg-red-900/20 p-2 rounded">
          ⚠️ {error}
        </p>
      )}

      {!subscription ? (
        <button
          onClick={handleSubscribe}
          disabled={permission === 'denied'}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            permission === 'denied'
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
          }`}
        >
          {permission === 'denied' 
            ? 'Permissão Negada' 
            : permission === 'granted'
              ? 'Reativar Notificações'
              : 'Ativar Notificações'}
        </button>
      ) : (
        <div className="space-y-2">
          <button
            onClick={handleUnsubscribe}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Desativar Notificações
          </button>
          
          <button
            onClick={testLocalNotification}
            className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg font-medium transition-colors text-sm"
          >
            Testar Notificação
          </button>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          ℹ️ As notificações serão enviadas 15 minutos antes das partidas começarem.
        </p>
      </div>
    </div>
  );
}
