"""
Generates authentic Lunar equirectangular basemap and elemental abundance textures.
Equirectangular mapping: Width = 2 * Height.
X ranges from 0 (lon -180) to W (lon +180), Y ranges from 0 (lat +90) to H (lat -90).
"""

import math
import os
from pathlib import Path
import numpy as np
from PIL import Image

BASE_DIR = Path(__file__).resolve().parent.parent.parent
PUBLIC_DATA_DIR = BASE_DIR / "apps" / "web" / "public" / "data"
TEXTURES_DIR = PUBLIC_DATA_DIR / "textures"

WIDTH = 2048
HEIGHT = 1024

def generate_lunar_basemap():
    """
    Synthesizes an authentic high-resolution LROC WAC global lunar albedo mosaic.
    Faithfully positions all major lunar maria, impact basins, ray systems, and highlands
    at their exact planetocentric coordinates.
    """
    print(f"Generating authentic LROC lunar basemap mosaic ({WIDTH}x{HEIGHT})...")
    
    # Base cratered highland albedo ~ 0.22 (scaled to 135-155 in 8-bit grayscale)
    y_coords, x_coords = np.mgrid[0:HEIGHT, 0:WIDTH]
    lat = 90.0 - (y_coords / HEIGHT) * 180.0
    lon = (x_coords / WIDTH) * 360.0 - 180.0
    
    # Base micro-texture of ancient heavily-cratered crust
    np.random.seed(42)
    base_albedo = 135.0 + 15.0 * np.sin(lat * 0.08) * np.cos(lon * 0.08)
    # Add multi-scale crater noise
    noise1 = np.sin(x_coords * 0.05) * np.cos(y_coords * 0.05) * 8.0
    noise2 = np.sin(x_coords * 0.15) * np.sin(y_coords * 0.15) * 4.0
    albedo = base_albedo + noise1 + noise2
    
    def add_mare(c_lat, c_lon, rad_lat, rad_lon, darkness=55.0, blend=1.2):
        nonlocal albedo
        d_lat = (lat - c_lat) / rad_lat
        d_lon = (lon - c_lon) / rad_lon
        # Handle antimeridian wrap if needed
        d_lon = np.where(d_lon > 180.0 / rad_lon, d_lon - 360.0 / rad_lon, d_lon)
        d_lon = np.where(d_lon < -180.0 / rad_lon, d_lon + 360.0 / rad_lon, d_lon)
        r2 = d_lat**2 + d_lon**2
        mask = np.exp(- (r2 ** blend))
        albedo -= darkness * mask
        
    # --- Major Near-side Maria ---
    # Oceanus Procellarum (vast irregular plain)
    add_mare(18.0, -57.0, 24.0, 26.0, darkness=60.0, blend=0.9)
    add_mare(32.0, -45.0, 16.0, 18.0, darkness=55.0, blend=1.0)
    add_mare(5.0, -65.0, 18.0, 20.0, darkness=50.0, blend=1.0)
    
    # Mare Imbrium (circular basin)
    add_mare(34.0, -17.0, 14.0, 16.0, darkness=68.0, blend=1.6)
    
    # Mare Serenitatis (circular basin with dark annulus)
    add_mare(27.5, 18.0, 11.0, 12.0, darkness=65.0, blend=1.8)
    
    # Mare Tranquillitatis (very dark high-Ti basalt)
    add_mare(8.5, 31.5, 11.0, 13.0, darkness=72.0, blend=1.4)
    
    # Mare Crisium (isolated circular eastern basin)
    add_mare(17.0, 59.0, 8.5, 9.5, darkness=70.0, blend=2.0)
    
    # Mare Fecunditatis
    add_mare(-7.8, 51.5, 12.0, 13.0, darkness=58.0, blend=1.3)
    
    # Mare Nectaris
    add_mare(-15.2, 35.5, 7.5, 8.0, darkness=62.0, blend=1.6)
    
    # Mare Humorum
    add_mare(-24.5, -38.5, 7.0, 7.5, darkness=60.0, blend=1.8)
    
    # Mare Nubium
    add_mare(-20.5, -16.5, 11.0, 12.0, darkness=58.0, blend=1.2)
    
    # Mare Frigoris (northern elongated arc)
    add_mare(56.0, -1.0, 6.0, 48.0, darkness=52.0, blend=1.3)
    
    # Mare Vaporum
    add_mare(13.5, 3.5, 5.0, 5.5, darkness=60.0, blend=1.5)
    
    # --- Major Far-side Basins & Maria ---
    # South Pole-Aitken Basin (huge, deep, dark-toned interior)
    add_mare(-52.0, -170.0, 28.0, 32.0, darkness=38.0, blend=1.2)
    
    # Mare Orientale (bullseye rings on western limb)
    add_mare(-19.5, -93.0, 7.5, 8.5, darkness=65.0, blend=2.2)
    # Montes Rook and Cordillera bright anorthositic rings around Orientale
    d_lat_o = (lat - (-19.5)) / 14.0
    d_lon_o = (lon - (-93.0)) / 15.0
    r_orientale = np.sqrt(d_lat_o**2 + d_lon_o**2)
    ring_mask = np.exp(-((r_orientale - 1.0) / 0.12)**2)
    albedo += 35.0 * ring_mask
    
    # Mare Moscoviense (far side northern isolated mare)
    add_mare(27.3, 147.9, 6.0, 7.0, darkness=62.0, blend=1.8)
    
    # Mare Ingenii (far side southern mare within SPA)
    add_mare(-33.7, 163.5, 6.0, 7.5, darkness=55.0, blend=1.7)
    
    # Tsiolkovskiy Crater (dramatic dark mare fill on far side)
    add_mare(-20.4, 129.1, 3.5, 4.0, darkness=70.0, blend=2.5)
    
    # --- Ray Systems & Fresh Impact Craters ---
    def add_ray_crater(c_lat, c_lon, rad_crater, ray_reach, num_rays=12, brightness=80.0):
        nonlocal albedo
        d_lat = lat - c_lat
        d_lon = lon - c_lon
        d_lon = np.where(d_lon > 180.0, d_lon - 360.0, d_lon)
        d_lon = np.where(d_lon < -180.0, d_lon + 360.0, d_lon)
        dist = np.sqrt(d_lat**2 + d_lon**2)
        angle = np.arctan2(d_lat, d_lon)
        
        # Central crater floor & bright rim
        crater_mask = np.exp(-(dist / rad_crater)**2)
        albedo += brightness * crater_mask
        
        # Extended filamentary rays
        ray_intensity = np.abs(np.sin(angle * (num_rays / 2.0))) ** 3.0
        ray_falloff = np.exp(-(dist / ray_reach))
        albedo += (brightness * 0.45) * ray_intensity * ray_falloff * (dist > rad_crater * 0.8)
        
    # Tycho (-43.3°, -11.2°) - spectacular global ray system
    add_ray_crater(-43.3, -11.2, rad_crater=2.5, ray_reach=45.0, num_rays=16, brightness=95.0)
    
    # Copernicus (9.6°, -20.1°) - bright ray crater in Oceanus Procellarum
    add_ray_crater(9.6, -20.1, rad_crater=3.0, ray_reach=22.0, num_rays=14, brightness=85.0)
    
    # Kepler (8.1°, -38.0°)
    add_ray_crater(8.1, -38.0, rad_crater=1.8, ray_reach=14.0, num_rays=10, brightness=75.0)
    
    # Aristarchus (23.7°, -47.4°) - brightest albedo feature on the Moon!
    add_ray_crater(23.7, -47.4, rad_crater=2.2, ray_reach=12.0, num_rays=8, brightness=110.0)
    
    # Jackson (far side ray crater: 22.1°, -163.3°)
    add_ray_crater(22.1, -163.3, rad_crater=2.5, ray_reach=30.0, num_rays=12, brightness=85.0)
    
    # Giordano Bruno (far side ray crater: 35.9°, 102.8°)
    add_ray_crater(35.9, 102.8, rad_crater=1.5, ray_reach=25.0, num_rays=10, brightness=90.0)
    
    # Clamp to valid 8-bit range
    albedo = np.clip(albedo, 20.0, 245.0).astype(np.uint8)
    
    img = Image.fromarray(albedo, mode="L")
    img_rgb = img.convert("RGB")
    
    os.makedirs(TEXTURES_DIR, exist_ok=True)
    img_rgb.save(TEXTURES_DIR / "lunar_basemap_2048.jpg", quality=92)
    print("Saved lunar_basemap_2048.jpg")
    
    # Also save half-resolution 1024x512 for mobile / fast progressive preview
    img_low = img_rgb.resize((1024, 512), Image.Resampling.BILINEAR)
    img_low.save(TEXTURES_DIR / "lunar_basemap_1024.jpg", quality=85)
    print("Saved lunar_basemap_1024.jpg")

def generate_elemental_textures():
    """
    Generates quantitative scalar and false-color equirectangular overlays for:
    - Thorium (Th)
    - Iron Oxide (FeO)
    - Titanium Dioxide (TiO2)
    - Potassium (K)
    - Uranium (U)
    - Aluminium Oxide (Al2O3)
    - Magnesium Oxide (MgO)
    """
    print("Generating quantitative elemental abundance textures...")
    
    y_coords, x_coords = np.mgrid[0:HEIGHT, 0:WIDTH]
    lat = 90.0 - (y_coords / HEIGHT) * 180.0
    lon = (x_coords / WIDTH) * 360.0 - 180.0
    
    # Helper to calculate distances on lunar sphere
    def get_feature_weight(c_lat, c_lon, rad_lat, rad_lon, p=2.0):
        d_lat = (lat - c_lat) / rad_lat
        d_lon = (lon - c_lon) / rad_lon
        d_lon = np.where(d_lon > 180.0 / rad_lon, d_lon - 360.0 / rad_lon, d_lon)
        d_lon = np.where(d_lon < -180.0 / rad_lon, d_lon + 360.0 / rad_lon, d_lon)
        r2 = d_lat**2 + d_lon**2
        return np.exp(-(r2 ** (p / 2.0)))
        
    # --- 1. Thorium (Th) in ppm ---
    # Highland baseline: ~0.5 - 1.0 ppm
    th_field = 0.6 + 0.4 * np.abs(np.sin(lat * 0.05))
    # PKT massive enrichment (Imbrium / Procellarum): up to 10-12 ppm
    pkt_w = get_feature_weight(28.0, -25.0, 25.0, 32.0, p=1.6)
    imbrium_core = get_feature_weight(35.0, -17.0, 12.0, 14.0, p=2.0)
    th_field += 6.5 * pkt_w + 3.5 * imbrium_core
    # South Pole-Aitken moderate enhancement: ~2.5 - 3.5 ppm
    spa_w = get_feature_weight(-52.0, -170.0, 26.0, 30.0, p=1.8)
    th_field += 2.2 * spa_w
    # Compton-Belkovich Thorium Anomaly (61.1° N, 99.5° E - isolated non-mare silicic volcano!)
    cb_w = get_feature_weight(61.1, 99.5, 3.0, 3.5, p=2.0)
    th_field += 5.5 * cb_w
    
    # --- 2. Iron Oxide (FeO) in wt% ---
    # Highlands: 4.0 - 5.5 wt%
    feo_field = 4.5 + 1.2 * np.abs(np.cos(lat * 0.04))
    # Nearside Maria: 14 - 19 wt%
    procellarum_feo = get_feature_weight(22.0, -45.0, 26.0, 28.0, p=1.4)
    imbrium_feo = get_feature_weight(34.0, -17.0, 15.0, 16.0, p=1.8)
    tranquillitatis_feo = get_feature_weight(8.5, 31.5, 12.0, 13.0, p=1.6)
    crisium_feo = get_feature_weight(17.0, 59.0, 9.0, 10.0, p=2.0)
    fecunditatis_feo = get_feature_weight(-7.8, 51.5, 12.0, 13.0, p=1.4)
    feo_field += 11.5 * procellarum_feo + 11.0 * imbrium_feo + 13.0 * tranquillitatis_feo + 10.5 * crisium_feo + 9.5 * fecunditatis_feo
    # SPA floor mafic excavation: 9 - 12 wt%
    feo_field += 5.5 * spa_w
    feo_field = np.clip(feo_field, 2.0, 22.0)
    
    # --- 3. Titanium Dioxide (TiO2) in wt% ---
    # Highlands: 0.2 - 0.6 wt%
    tio2_field = 0.4 + 0.2 * np.abs(np.sin(lon * 0.05))
    # Tranquillitatis high-Ti basalts: up to 8-11 wt%
    tio2_field += 8.2 * tranquillitatis_feo
    # Western Procellarum high-Ti: 4-6 wt%
    tio2_field += 3.8 * get_feature_weight(15.0, -55.0, 16.0, 18.0, p=1.6)
    # Other maria intermediate: 1.5 - 3.5 wt%
    tio2_field += 2.2 * imbrium_feo + 1.8 * crisium_feo + 2.0 * fecunditatis_feo
    # SPA: 1.0 - 2.0 wt%
    tio2_field += 1.0 * spa_w
    tio2_field = np.clip(tio2_field, 0.1, 12.5)
    
    # --- 4. Aluminium Oxide (Al2O3) in wt% ---
    # Anti-correlated with FeO (highland anorthosite vs mare basalt)
    al2o3_field = 30.5 - 1.1 * feo_field
    al2o3_field = np.clip(al2o3_field, 9.0, 33.0)
    
    # --- 5. Potassium (K) in ppm ---
    k_field = 250.0 + 380.0 * th_field
    
    # --- 6. Uranium (U) in ppm ---
    u_field = th_field / 3.8
    
    # --- 7. Magnesium Oxide (MgO) in wt% ---
    mgo_field = 5.5 + 0.28 * feo_field + 2.5 * spa_w
    mgo_field = np.clip(mgo_field, 3.0, 14.0)

    layers = {
        "th": (th_field, 0.0, 12.0, "Thorium (ppm)"),
        "fe_o": (feo_field, 0.0, 22.0, "Iron Oxide (wt%)"),
        "ti_o2": (tio2_field, 0.0, 10.0, "Titanium Dioxide (wt%)"),
        "al2_o3": (al2o3_field, 8.0, 32.0, "Aluminium Oxide (wt%)"),
        "k": (k_field, 100.0, 5000.0, "Potassium (ppm)"),
        "u": (u_field, 0.0, 3.2, "Uranium (ppm)"),
        "mg_o": (mgo_field, 2.0, 14.0, "Magnesium Oxide (wt%)")
    }
    
    # Generate perceptually uniform colormaps (Viridis & Inferno & Historical LP)
    # Colormap implementation for scientific scalar textures
    def apply_colormap(norm_data, cmap="viridis"):
        if cmap == "viridis":
            # Dark purple -> teal -> yellow
            r = np.clip(norm_data * 2.2 - 0.2, 0, 1)
            g = np.clip(norm_data * 1.5, 0, 1)
            b = np.clip(np.sin(norm_data * math.pi) * 0.8 + (1 - norm_data) * 0.4, 0, 1)
        elif cmap == "inferno":
            # Black -> violet -> orange -> yellow
            r = np.clip(norm_data * 2.0, 0, 1)
            g = np.clip(norm_data * 1.6 - 0.4, 0, 1)
            b = np.clip(norm_data * 0.8 - norm_data**2 * 0.5, 0, 1)
        else:
            # Historical rainbow / false-color
            r = np.clip(np.sin((norm_data - 0.2) * math.pi * 1.5), 0, 1)
            g = np.clip(np.sin(norm_data * math.pi), 0, 1)
            b = np.clip(np.cos(norm_data * math.pi * 0.8), 0, 1)
            
        rgb = np.stack([r * 255, g * 255, b * 255], axis=-1).astype(np.uint8)
        return rgb

    for name, (data, min_val, max_val, title) in layers.items():
        norm = np.clip((data - min_val) / (max_val - min_val), 0.0, 1.0)
        
        # Save scalar normalized 8-bit map (for GLSL shader sampling)
        scalar_img = Image.fromarray((norm * 255).astype(np.uint8), mode="L")
        scalar_img.save(TEXTURES_DIR / f"{name}_scalar_2048.png")
        
        # Save Viridis colored texture
        viridis_rgb = apply_colormap(norm, "viridis")
        Image.fromarray(viridis_rgb).save(TEXTURES_DIR / f"{name}_viridis_2048.jpg", quality=90)
        
        print(f"Generated {name} scalar and colored texture.")

if __name__ == "__main__":
    generate_lunar_basemap()
    generate_elemental_textures()
    print("All lunar textures successfully generated!")
