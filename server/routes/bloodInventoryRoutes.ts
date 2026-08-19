import { Router } from 'express';
import { fetchLiveBloodStock, BloodBankItem } from '../services/eraktkoshScraper';

const router = Router();

interface CacheEntry {
  timestamp: number;
  data: BloodBankItem[];
}

const inventoryCache: Record<string, CacheEntry> = {};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache TTL

router.get('/', async (req, res) => {
  try {
    const stateCode = (req.query.state as string) || '09';
    const districtCode = (req.query.district as string) || '143';
    const rareOnly = req.query.rareOnly === 'true';
    const force = req.query.force === 'true';

    const cacheKey = `${stateCode}_${districtCode}`;
    const now = Date.now();
    let inventory: BloodBankItem[] = [];
    let isCached = false;
    let cacheAgeMinutes = 0;

    if (!force && inventoryCache[cacheKey] && (now - inventoryCache[cacheKey].timestamp) < CACHE_TTL_MS) {
      inventory = inventoryCache[cacheKey].data;
      isCached = true;
      cacheAgeMinutes = Math.floor((now - inventoryCache[cacheKey].timestamp) / 60000);
    } else {
      inventory = await fetchLiveBloodStock(stateCode, districtCode, 'all');
      inventoryCache[cacheKey] = {
        timestamp: now,
        data: inventory
      };
      isCached = false;
      cacheAgeMinutes = 0;
    }

    let filtered = inventory;
    if (rareOnly) {
      filtered = inventory.filter(item => {
        if (item.isRarePhenotype) return true;
        if (item.groupBreakdown) {
          const bombay = item.groupBreakdown['Bombay Oh'] || item.groupBreakdown['Bombay Phenotype'] || 0;
          const oNeg = item.groupBreakdown['O-'] || 0;
          const aNeg = item.groupBreakdown['A-'] || 0;
          const bNeg = item.groupBreakdown['B-'] || 0;
          const abNeg = item.groupBreakdown['AB-'] || 0;
          if (bombay > 0 || oNeg > 0 || aNeg > 0 || bNeg > 0 || abNeg > 0) return true;
        }
        return false;
      });
    }

    const totalFacilities = filtered.length;
    const rarePhenotypesCount = filtered.filter(i => i.isRarePhenotype).length;
    const totalUnitsAvailable = filtered.reduce((acc, item) => acc + item.availableUnits, 0);

    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      cached: isCached,
      cacheAgeMinutes,
      totalFacilities,
      rarePhenotypesCount,
      totalUnitsAvailable,
      districtCode,
      stateCode,
      inventory: filtered
    });
  } catch (error: any) {
    console.error('[Blood Inventory API Error]:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch blood inventory'
    });
  }
});

export default router;
