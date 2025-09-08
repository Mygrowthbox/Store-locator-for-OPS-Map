import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { Shop, getCategoryColor, getCategoryIcon } from '@/types/shop';
import { Card } from '@/components/ui/card';
import { useDuplicateDetection } from '@/hooks/useDuplicateDetection';

// Fix default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  shops: Shop[];
  onShopClick?: (shop: Shop) => void;
  center?: [number, number];
  zoom?: number;
  className?: string;
}

const MapView = ({ 
  shops, 
  onShopClick, 
  center = [46.603354, 1.888334], // France center
  zoom = 6,
  className 
}: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.MarkerClusterGroup | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  // Create custom colored markers with icons
  const createColoredIcon = (category: string) => {
    const categoryColor = getCategoryColor(category);
    const iconName = getCategoryIcon(category);
    
    const colors = {
      restaurant: '#e97749',
      shop: '#9333ea', 
      service: '#f59e0b',
      'bike-shop': '#06b6d4',
      'bike-workshop': '#10b981',
      'bike-mobile': '#f97316',
      'bike-pump': '#8b5cf6',
      'bike-parking': '#ef4444',
      default: '#0891b2'
    };
    
    const icons = {
      utensils: '🍽️',
      coffee: '☕',
      wine: '🍷',
      wheat: '🌾',
      cake: '🧁',
      'shopping-bag': '🛍️',
      store: '🏪',
      'shopping-cart': '🛒',
      cross: '💊',
      'book-open': '📚',
      wrench: '🔧',
      hammer: '🔨',
      scissors: '✂️',
      landmark: '🏦',
      bed: '🏨',
      car: '🚗',
      bike: '🚲',
      users: '👥',
      truck: '🚛',
      wind: '💨',
      'shield-check': '🔒',
      'map-pin': '📍'
    };
    
    const color = colors[categoryColor as keyof typeof colors] || colors.default;
    const iconSymbol = icons[iconName as keyof typeof icons] || icons['map-pin'];
    
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        ">
          ${iconSymbol}
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15]
    });
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current, {
      center,
      zoom,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

  // Initialize marker cluster group with optimized settings for large datasets
  const markerClusterGroup = L.markerClusterGroup({
    chunkedLoading: true,
    chunkInterval: 200,
    chunkDelay: 50,
    maxClusterRadius: 80,
    spiderfyOnMaxZoom: false,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    removeOutsideVisibleBounds: true,
    iconCreateFunction: (cluster) => {
      const count = cluster.getChildCount();
      let size = 'small';
      if (count < 10) size = 'small';
      else if (count < 100) size = 'medium'; 
      else size = 'large';
      
      const sizeMap = {
        small: { width: 30, height: 30, fontSize: '11px' },
        medium: { width: 40, height: 40, fontSize: '13px' },
        large: { width: 50, height: 50, fontSize: '15px' }
      };
      
      const { width, height, fontSize } = sizeMap[size];
      
      return L.divIcon({
        html: `<div style="
          background: linear-gradient(135deg, #0891b2, #0284c7);
          color: white;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: ${fontSize};
          width: ${width}px;
          height: ${height}px;
        ">${count}</div>`,
        className: 'marker-cluster',
        iconSize: L.point(width, height),
      });
    }
  });

    map.addLayer(markerClusterGroup);

    mapInstanceRef.current = map;
    markersRef.current = markerClusterGroup;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = null;
      }
    };
  }, []);

  // Update markers when shops change - optimized for large datasets
  useEffect(() => {
    if (!markersRef.current) return;

    markersRef.current.clearLayers();

    if (shops.length === 0) return;

    // Process markers in batches for better performance
    const batchSize = 100;
    let currentIndex = 0;

    const processBatch = () => {
      const batch = shops.slice(currentIndex, currentIndex + batchSize);
      
      batch.forEach((shop) => {
        const marker = L.marker([shop.latitude, shop.longitude], {
          icon: createColoredIcon(shop.category)
        });

        const popupContent = `
          <div style="min-width: 200px; font-family: system-ui;">
            <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600;">${shop.name}</h3>
            <p style="margin: 0 0 4px 0; font-size: 11px; color: #666; background: #f3f4f6; padding: 2px 6px; border-radius: 4px; display: inline-block;">${shop.category}</p>
            <p style="margin: 0; font-size: 12px; color: #374151;">${shop.address}</p>
            <p style="margin: 2px 0 0 0; font-size: 11px; color: #6b7280;">${shop.department}, ${shop.country}</p>
            ${shop.website ? `<p style="margin: 4px 0 0 0;"><a href="${shop.website}" target="_blank" rel="nofollow" style="color: #0891b2; text-decoration: none; font-size: 11px;">Site web →</a></p>` : ''}
          </div>
        `;

        marker.bindPopup(popupContent, {
          maxWidth: 250,
          className: 'custom-popup'
        });

        marker.on('click', () => {
          setSelectedShop(shop);
          if (onShopClick) {
            onShopClick(shop);
          }
        });

        markersRef.current?.addLayer(marker);
      });

      currentIndex += batchSize;
      
      if (currentIndex < shops.length) {
        // Process next batch asynchronously
        setTimeout(processBatch, 10);
      } else {
        // All markers processed, fit bounds
        if (shops.length > 0 && mapInstanceRef.current) {
          const group = L.featureGroup(shops.slice(0, 50).map(shop => 
            L.marker([shop.latitude, shop.longitude])
          ));
          mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [20, 20] });
        }
      }
    };

    processBatch();
  }, [shops, onShopClick]);

  return (
    <Card className="overflow-hidden shadow-card">
      <div 
        ref={mapRef} 
        className={`w-full h-[500px] ${className}`}
        style={{ background: 'hsl(var(--map-bg))' }}
      />
    </Card>
  );
};

export default MapView;