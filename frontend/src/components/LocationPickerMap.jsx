import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = { lat: 10.7769, lng: 106.7009 };

const pinIcon = L.divIcon({
  className: "shipping-map-pin-wrapper",
  html: '<div class="shipping-map-pin"></div>',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

function RecenterMap({ position }) {
  const map = useMap();

  useEffect(() => {
    if (!position) return;
    map.flyTo(position, Math.max(map.getZoom(), 16), { duration: 0.8 });
  }, [map, position]);

  return null;
}

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect(event.latlng);
    },
  });

  return null;
}

export default function LocationPickerMap({
  value,
  onChange,
  onLocateMe,
  locateMeLoading = false,
}) {
  const center = value || DEFAULT_CENTER;

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>Pin on Map</div>
          <div style={styles.sub}>
            Bam len ban do hoac keo ghim de lay dia chi giao hang tu dong.
          </div>
        </div>
        <button
          type="button"
          onClick={onLocateMe}
          disabled={locateMeLoading}
          style={{
            ...styles.locateButton,
            opacity: locateMeLoading ? 0.75 : 1,
            cursor: locateMeLoading ? "wait" : "pointer",
          }}
        >
          {locateMeLoading ? "Dang lay vi tri..." : "Dung vi tri cua toi"}
        </button>
      </div>

      <div style={styles.mapFrame}>
        <MapContainer
          center={center}
          zoom={value ? 16 : 13}
          scrollWheelZoom
          style={styles.map}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onSelect={onChange} />
          <RecenterMap position={value} />
          {value && (
            <Marker
              draggable
              position={value}
              icon={pinIcon}
              eventHandlers={{
                dragend: (event) => {
                  const marker = event.target;
                  const nextPosition = marker.getLatLng();
                  onChange(nextPosition);
                },
              }}
            />
          )}
        </MapContainer>

        {!value && (
          <div style={styles.emptyState}>
            <div style={styles.emptyBadge}>Chua chon vi tri</div>
            <div style={styles.emptyText}>
              Ban co the bam vao mot diem bat ky tren ban do de them ghim.
            </div>
          </div>
        )}
      </div>

      {value && (
        <div style={styles.coords}>
          Lat {value.lat.toFixed(6)} | Lng {value.lng.toFixed(6)}
        </div>
      )}

      <style>{`
        .shipping-map-pin-wrapper {
          background: transparent;
          border: none;
        }

        .shipping-map-pin {
          width: 28px;
          height: 28px;
          background: #1a3c2e;
          border: 3px solid #ffffff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 10px 24px rgba(26, 60, 46, 0.28);
          position: relative;
        }

        .shipping-map-pin::after {
          content: "";
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #a8d5b5;
          position: absolute;
          left: 7px;
          top: 7px;
        }

        .leaflet-control-attribution {
          font-size: 10px;
        }
      `}</style>
    </div>
  );
}

const styles = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
  },
  title: {
    fontSize: "0.86rem",
    fontWeight: "800",
    color: "#1a1a1a",
  },
  sub: {
    fontSize: "0.78rem",
    color: "#7b7b7b",
    marginTop: "4px",
    lineHeight: 1.6,
  },
  locateButton: {
    border: "1px solid #d5d3cd",
    background: "#fff",
    color: "#1a3c2e",
    borderRadius: "10px",
    padding: "10px 14px",
    fontSize: "0.78rem",
    fontWeight: "700",
    fontFamily: "inherit",
  },
  mapFrame: {
    position: "relative",
    borderRadius: "16px",
    overflow: "hidden",
    border: "1px solid #e4e1dc",
  },
  map: {
    width: "100%",
    height: "320px",
  },
  emptyState: {
    position: "absolute",
    left: "16px",
    right: "16px",
    bottom: "16px",
    background: "rgba(255,255,255,0.94)",
    border: "1px solid rgba(26,60,46,0.12)",
    boxShadow: "0 12px 24px rgba(18, 26, 21, 0.08)",
    borderRadius: "12px",
    padding: "12px 14px",
    pointerEvents: "none",
  },
  emptyBadge: {
    display: "inline-block",
    padding: "4px 9px",
    background: "#f0f7f3",
    color: "#1a3c2e",
    borderRadius: "999px",
    fontSize: "0.68rem",
    fontWeight: "800",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    marginBottom: "8px",
  },
  emptyText: {
    fontSize: "0.8rem",
    color: "#555",
    lineHeight: 1.6,
  },
  coords: {
    fontSize: "0.76rem",
    color: "#6e6e6e",
    background: "#faf9f7",
    border: "1px solid #ebebeb",
    borderRadius: "10px",
    padding: "10px 12px",
  },
};
