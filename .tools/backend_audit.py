import os
import re
import json
import urllib.request

root = r"C:\Users\Santhosh\Downloads\mokijo-sports-and-band-app-feature-landing-and-band-fix"
backend_dir = os.path.join(root, 'backend', 'app')

def read_file(path):
    try:
        with open(path, encoding='utf-8', errors='ignore') as fh:
            return fh.read()
    except Exception:
        return ''

router_vars = {}  # varname -> file
include_calls = []  # (file, arg_text, prefix)
source_endpoints = {}  # path -> list of (method, file)

pat_apirouter = re.compile(r"(\w+)\s*=\s*APIRouter\(")
pat_include = re.compile(r"include_router\(\s*([\w\.]+)\s*(?:,|\))(?:.*?prefix\s*=\s*[\"']([^\"']+)[\"'])?", re.S)
pat_decorator = re.compile(r"@(?:[\w\.]+\.)?router\.(get|post|put|delete|patch)\(\s*[\"']([^\"']+)[\"']")
pat_add_route = re.compile(r"add_api_route\(\s*[\"']([^\"']+)[\"']")

for dirpath, dirs, files in os.walk(backend_dir):
    for f in files:
        if not f.endswith('.py'):
            continue
        fp = os.path.join(dirpath, f)
        rel = os.path.relpath(fp, backend_dir)
        text = read_file(fp)
        for m in pat_apirouter.finditer(text):
            var = m.group(1)
            router_vars[var] = rel
        for m in pat_include.finditer(text):
            arg = m.group(1)
            prefix = m.group(2) or ''
            include_calls.append({'file': rel, 'arg': arg, 'prefix': prefix})
        for m in pat_decorator.finditer(text):
            method = m.group(1).upper()
            path = m.group(2)
            source_endpoints.setdefault(path, []).append({'method': method, 'file': rel})
        for m in pat_add_route.finditer(text):
            path = m.group(1)
            source_endpoints.setdefault(path, []).append({'method': 'VAR', 'file': rel})

# Build mapping of routers defined but not referenced in include_router calls
defined_routers = set(router_vars.keys())
included_router_args = set([c['arg'] for c in include_calls])
not_mounted = [v for v in defined_routers if v not in included_router_args]

# Fetch runtime OpenAPI
openapi = {}
try:
    with urllib.request.urlopen('http://127.0.0.1:8001/openapi.json', timeout=5) as resp:
        openapi = json.load(resp)
except Exception as e:
    openapi = {'error': str(e)}

runtime_paths = {}
if 'paths' in openapi:
    for p, methods in openapi['paths'].items():
        runtime_paths[p] = list(m.upper() for m in methods.keys())

# Collect modules under backend/app/api
api_modules = {}
api_base = os.path.join(backend_dir, 'api')
if os.path.isdir(api_base):
    for name in sorted(os.listdir(api_base)):
        p = os.path.join(api_base, name)
        if os.path.isdir(p):
            # collect source endpoints from files in this module
            mod_endpoints = {}
            for dirpath, dirs, files in os.walk(p):
                for f in files:
                    if not f.endswith('.py'):
                        continue
                    fp = os.path.join(dirpath, f)
                    rel = os.path.relpath(fp, backend_dir)
                    text = read_file(fp)
                    for m in pat_decorator.finditer(text):
                        method = m.group(1).upper()
                        path = m.group(2)
                        mod_endpoints.setdefault(path, []).append({'method': method, 'file': rel})
                    for m in pat_add_route.finditer(text):
                        path = m.group(1)
                        mod_endpoints.setdefault(path, []).append({'method': 'VAR', 'file': rel})
            api_modules[name] = {'module_path': os.path.relpath(p, backend_dir), 'source_endpoints': mod_endpoints}

# Prepare module-wise report for requested BandConnect modules
band_modules = ['band_auth','band','band_artists','band_venues','band_bookings','band_categories','band_locations','band_reviews','band_settings','band_earnings']
report = {'defined_routers': router_vars, 'include_calls': include_calls, 'not_mounted_router_vars': not_mounted, 'source_endpoint_count': len(source_endpoints), 'runtime_paths_count': len(runtime_paths), 'runtime_error': openapi.get('error',''), 'modules': {}}

for mod in sorted(api_modules.keys()):
    info = api_modules[mod]
    detected = list(info['source_endpoints'].keys())
    # runtime detection: match paths starting with /mod or /band/... heuristics
    runtime_detected = [p for p in runtime_paths.keys() if p.startswith(f'/{mod}') or p.startswith(f'/band')]
    report['modules'][mod] = {
        'expected_count': len(detected),
        'detected_in_source': detected,
        'detected_in_runtime': runtime_detected,
        'router_defined': any(rv.startswith(info['module_path']) for rv in router_vars.values()),
        'router_mounted': any(c['arg'] in router_vars for c in include_calls if c['file']!='')
    }

# Special checks for requested BandConnect areas
band_report = {}
for key in ['band_auth','band_artists','band_venues','band_bookings','band_reviews','band_settings']:
    band_report[key] = report['modules'].get(key, {'expected_count':0,'detected_in_source':[],'detected_in_runtime':[],'router_defined':False,'router_mounted':False})

out = os.path.join(root, 'backend_audit_report.json')
with open(out, 'w', encoding='utf-8') as fh:
    json.dump({'summary': report, 'band_report': band_report, 'runtime_paths': runtime_paths}, fh, indent=2)

print('WROTE', out)
print('SOURCE_ENDPOINTS:', len(source_endpoints))
print('RUNTIME_PATHS:', len(runtime_paths))
if openapi.get('error'):
    print('OPENAPI_FETCH_ERROR:', openapi.get('error'))