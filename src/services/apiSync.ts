/**
 * Serviço de sincronização com o banco de dados MySQL na Hostinger
 * API Endpoints: /api/sync.php e /api/health.php
 */

export interface HostingerSyncPayload {
  restaurant_id: string;
  restaurant_name?: string;
  restaurant_city?: string;
  items: {
    tables?: any;
    comandas?: any;
    products?: any;
    transactions?: any;
    digitalOrders?: any;
    paymentSettings?: any;
    restaurants?: any;
  };
}

/**
 * Envia o estado local do restaurante para o MySQL da Hostinger
 */
export async function syncWithHostinger(payload: HostingerSyncPayload): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch('/api/sync.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Erro na resposta do servidor: HTTP ${response.status}`);
    }

    const result = await response.json();
    return {
      success: result.status === 'success',
      message: result.message || 'Sincronizado com sucesso'
    };
  } catch (error: any) {
    console.warn('Falha na sincronização com a Hostinger (operando em modo local):', error?.message || error);
    return {
      success: false,
      message: error?.message || 'Servidor inacessível'
    };
  }
}

/**
 * Carrega o estado mais recente do restaurante a partir do MySQL da Hostinger
 */
export async function fetchFromHostinger(restaurantId: string): Promise<Record<string, any> | null> {
  try {
    const response = await fetch(`/api/sync.php?restaurant_id=${encodeURIComponent(restaurantId)}`);
    if (!response.ok) {
      return null;
    }
    const result = await response.json();
    if (result.status === 'success' && result.data && Object.keys(result.data).length > 0) {
      return result.data;
    }
    return null;
  } catch (error) {
    console.warn('Não foi possível buscar dados da nuvem Hostinger:', error);
    return null;
  }
}

/**
 * Verifica a saúde da conexão com o banco de dados na Hostinger
 */
export async function checkHostingerHealth(): Promise<{ online: boolean; serverTime?: string }> {
  try {
    const response = await fetch('/api/health.php');
    if (!response.ok) return { online: false };
    const data = await response.json();
    return {
      online: data.status === 'online',
      serverTime: data.server_time
    };
  } catch {
    return { online: false };
  }
}
