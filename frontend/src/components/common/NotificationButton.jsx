import { usePushNotifications } from '../../hooks/usePushNotifications';

export function NotificationButton() {
  const {
    isSupported,
    subscription,
    permission,
    loading,
    error,
    subscribeToPush,
  } = usePushNotifications();

  const handleSubscribe = async () => {
    try {
      await subscribeToPush();
      alert('Notificações ativadas com sucesso! Você será notificado sobre partidas próximas.');
    } catch (err) {

      alert('Erro ao ativar notificações: ' + err.message);
    }
  };

  if (!isSupported || loading || subscription || permission === 'denied') {
    return null;
  }

  return (
    <div className="notification-button-container">
      <button
        onClick={handleSubscribe}
        className="notification-btn"
        title="Ativar notificações de partidas"
      >
        <svg className="bell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        NOTIFICAÇÕES
      </button>
    </div>
  );
}
