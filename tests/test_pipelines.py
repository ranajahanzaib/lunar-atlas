import json
import math
from pathlib import Path
import pytest

BASE_DIR = Path(__file__).resolve().parent.parent
PROCESSED_DIR = BASE_DIR / "data" / "processed"
PUBLIC_DATA_DIR = BASE_DIR / "apps" / "web" / "public" / "data"

def test_orbital_observations_schema_and_counts():
    data_file = PUBLIC_DATA_DIR / "orbital_observations.json"
    assert data_file.exists(), "Orbital observations JSON must exist"
    
    with open(data_file) as f:
        cells = json.load(f)
        
    assert len(cells) >= 1600, f"Expected ~1652 equal-area cells, got {len(cells)}"
    
    # Check individual cell structure and physical bounds
    total_area = 0.0
    for cell in cells:
        assert "pixelId" in cell
        assert -90.0 <= cell["latMin"] <= 90.0
        assert -90.0 <= cell["latMax"] <= 90.0
        assert -180.0 <= cell["lonMin"] <= 180.0
        assert -180.0 <= cell["lonMax"] <= 180.0
        assert cell["areaKm2"] > 0
        total_area += cell["areaKm2"]
        
        abundances = cell["abundances"]
        assert 0.0 <= abundances["th"] <= 20.0, "Thorium abundance must be physically plausible (ppm)"
        assert 0.0 <= abundances["fe_o"] <= 30.0, "FeO abundance must be physically plausible (wt%)"
        assert 0.0 <= abundances["ti_o2"] <= 15.0, "TiO2 abundance must be physically plausible (wt%)"
        assert 0.0 <= abundances["al2_o3"] <= 40.0, "Al2O3 abundance must be physically plausible (wt%)"
        
        # Test uranium constraint: U = Th / 3.8
        expected_u = abundances["th"] / 3.8
        assert math.isclose(abundances["u"], expected_u, rel_tol=0.05)
        
    # Total lunar surface area approx 3.79e7 km2
    assert 3.5e7 <= total_area <= 4.0e7, f"Total surface area {total_area} km2 deviates from spherical Moon"

def test_lunar_regions_presence_and_chemistry():
    data_file = PUBLIC_DATA_DIR / "lunar_regions.json"
    assert data_file.exists()
    
    with open(data_file) as f:
        regions = json.load(f)
        
    reg_dict = {r["id"]: r for r in regions}
    assert "oceanus_procellarum" in reg_dict
    assert "mare_imbrium" in reg_dict
    assert "mare_tranquillitatis" in reg_dict
    assert "south_pole_aitken" in reg_dict
    assert "feldspathic_highlands_terrane" in reg_dict
    
    # Check that PKT has higher Th than FHT
    assert reg_dict["procellarum_kreep_terrane"]["meanAbundances"]["th"] > reg_dict["feldspathic_highlands_terrane"]["meanAbundances"]["th"]
    # Check that Tranquillitatis has high TiO2
    assert reg_dict["mare_tranquillitatis"]["meanAbundances"]["ti_o2"] > 6.0

def test_returned_samples_verification():
    data_file = PUBLIC_DATA_DIR / "returned_samples.json"
    assert data_file.exists()
    
    with open(data_file) as f:
        samples = json.load(f)
        
    sample_ids = {s["sampleId"]: s for s in samples}
    assert "15415" in sample_ids, "Genesis Rock must be in sample catalog"
    assert "10084" in sample_ids, "Apollo 11 regolith 10084 must be present"
    assert "74220" in sample_ids, "Apollo 17 Orange Soil must be present"
    assert "76535" in sample_ids, "Apollo 17 pristine troctolite must be present"
    
    for s in samples:
        loc = s["location"]
        assert loc["reviewStatus"] in ["verified", "station_level", "conflicting", "unmapped"]
        assert -90.0 <= loc["latitude"] <= 90.0
        assert -180.0 <= loc["longitude"] <= 180.0
        assert len(s["images"]) > 0, "Every sample must have authenticated imagery"
