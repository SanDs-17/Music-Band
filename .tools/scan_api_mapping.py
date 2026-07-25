import os
import re
import json
import csv

root = r"C:\Users\Santhosh\Downloads\mokijo-sports-and-band-app-feature-landing-and-band-fix"
backend_dir = os.path.join(root, 'backend', 'app')
frontend_dir = os.path.join(root, 'frontend')

backend_endpoints = {}

# Simple backend patterns
pat_decorator = re.compile(r"@(?:router|app)\.(get|post|put|delete|patch)\(\s*[\"']([^\"']+)[\"']")
pat_add_route = re.compile(r"add_api_route\(\s*(?:path\s*=\s*)?[\"']([^\"']+)[\"']")

for dirpath, dirs, files in os.walk(backend_dir):
	for f in files:
		if not f.endswith('.py'):
			continue
		fp = os.path.join(dirpath, f)
		try:
			text = open(fp, encoding='utf-8').read()
		except Exception:
			continue
		for m in pat_decorator.finditer(text):
			method = m.group(1).upper()
			path = m.group(2)
			backend_endpoints.setdefault(path, []).append({'method': method, 'file': os.path.relpath(fp, root)})
		for m in pat_add_route.finditer(text):
			path = m.group(1)
			backend_endpoints.setdefault(path, []).append({'method': 'VAR', 'file': os.path.relpath(fp, root)})

# Frontend patterns
frontend_calls = []
pat_fetch_template = re.compile(r"fetch\(\s*`\$\{API_BASE_URL\}/([^`\}]+)`")
pat_fetch_dq = re.compile(r"fetch\(\s*\"\$\{API_BASE_URL\}/([^\"]+)\"")
pat_fetch_sq = re.compile(r"fetch\(\s*'\$\{API_BASE_URL\}/([^\']+)'")
pat_bandapi = re.compile(r"bandApi\.(get|post|put|delete)\(\s*[\"']([^\"']+)[\"']")
pat_api = re.compile(r"\bapi\.(get|post|put|delete)\(\s*[\"']([^\"']+)[\"']")

for dirpath, dirs, files in os.walk(frontend_dir):
	for f in files:
		if not f.endswith(('.js', '.jsx', '.ts', '.tsx')):
			continue
		fp = os.path.join(dirpath, f)
		try:
			with open(fp, encoding='utf-8', errors='ignore') as fh:
				for i, line in enumerate(fh, start=1):
					for m in pat_fetch_template.finditer(line):
						frontend_calls.append({'file': os.path.relpath(fp, root), 'line': i, 'call': 'fetch', 'raw': m.group(1), 'api': 'API_BASE_URL'})
					for m in pat_fetch_dq.finditer(line):
						frontend_calls.append({'file': os.path.relpath(fp, root), 'line': i, 'call': 'fetch', 'raw': m.group(1), 'api': 'API_BASE_URL'})
					for m in pat_fetch_sq.finditer(line):
						frontend_calls.append({'file': os.path.relpath(fp, root), 'line': i, 'call': 'fetch', 'raw': m.group(1), 'api': 'API_BASE_URL'})
					for m in pat_bandapi.finditer(line):
						frontend_calls.append({'file': os.path.relpath(fp, root), 'line': i, 'call': f'bandApi.{m.group(1)}', 'raw': m.group(2), 'api': 'bandApi'})
					for m in pat_api.finditer(line):
						frontend_calls.append({'file': os.path.relpath(fp, root), 'line': i, 'call': f'api.{m.group(1)}', 'raw': m.group(2), 'api': 'api'})
		except Exception:
			continue

# Map
mappings = []
referenced = set()
for c in frontend_calls:
	raw = c['raw']
	api = c['api']
	if api == 'bandApi':
		full = '/band' + (raw if raw.startswith('/') else '/' + raw)
	else:
		full = '/' + raw.lstrip('/')
	backend_files = backend_endpoints.get(full)
	status = 'matched' if backend_files else 'missing'
	if backend_files:
		referenced.add(full)
	mappings.append({
		'frontend_file': c['file'],
		'frontend_line': c['line'],
		'frontend_call': c['call'],
		'api_source': api,
		'api_path_used': full,
		'backend_files': ';'.join([b['file']+':'+b['method'] for b in backend_files]) if backend_files else '',
		'status': status
	})

duplicates = {p:backend_endpoints[p] for p in backend_endpoints if len(backend_endpoints[p])>1}
unused = [p for p in backend_endpoints if p not in referenced]

out_csv = os.path.join(root, 'analysis_frontend_backend_mapping.csv')
with open(out_csv, 'w', newline='', encoding='utf-8') as cf:
	writer = csv.DictWriter(cf, fieldnames=['frontend_file','frontend_line','frontend_call','api_source','api_path_used','backend_files','status'])
	writer.writeheader()
	for row in mappings:
		writer.writerow(row)

summary = {
	'counts': {'frontend_calls': len(frontend_calls), 'backend_endpoints': len(backend_endpoints), 'mappings': len(mappings), 'duplicates': len(duplicates), 'unused_backend': len(unused), 'missing': sum(1 for m in mappings if m['status']=='missing')},
	'duplicates': {k:backend_endpoints[k] for k in duplicates},
	'unused_backend': unused,
}
with open(os.path.join(root, 'analysis_frontend_backend_mapping_summary.json'), 'w', encoding='utf-8') as jf:
	json.dump(summary, jf, indent=2)

print('WROTE', out_csv)
print('MISSING', summary['counts']['missing'])
print('DUPLICATES', len(duplicates))
print('UNUSED_BACKEND', len(unused))

