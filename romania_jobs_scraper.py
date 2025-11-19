""
🚀 ROMANIA JOBS SCRAPER V2
Fast job scraper for Romanian companies with better coverage
"""

import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
import time
from typing import List, Dict

class RomaniaJobScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        })
        
    def scrape_ejobs_romania(self, keyword: str = "") -> List[Dict]:
        """Extrage joburi de pe eJobs.ro"""
        print(f"🔍 eJobs Romania {f'(keyword: {keyword})' if keyword else ''}...")
        jobs = []
        
        try:
            url = "https://www.ejobs.ro/locuri-munca"
            if keyword:
                url += f"?q={keyword}"
            
            response = self.session.get(url, timeout=15)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            job_cards = soup.find_all(['div', 'article'], class_=['job-item', 'JobListItem'])[:30]
            
            for card in job_cards:
                try:
                    title = card.find(['h2', 'h3', 'a'])
                    company = card.find(class_=['company-name', 'CompanyName'])
                    location = card.find(class_=['location', 'Location'])
                    
                    if title:
                        jobs.append({
                            'company': company.get_text(strip=True) if company else 'N/A',
                            'title': title.get_text(strip=True),
                            'location': location.get_text(strip=True) if location else 'Romania',
                            'req_id': 'N/A',
                            'category': 'IT' if keyword else 'Various',
                            'job_type': 'N/A',
                            'is_remote': 'N/A',
                            'apply_link': 'https://www.ejobs.ro/',
                            'posted_date': 'N/A',
                            'source': 'eJobs'
                        })
                except:
                    continue
                    
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        print(f"   ✅ Found {len(jobs)} jobs")
        return jobs
    
    def scrape_bestjobs_romania(self, keyword: str = "") -> List[Dict]:
        """Extrage joburi de pe BestJobs.ro"""
        print(f"🔍 BestJobs Romania {f'(keyword: {keyword})' if keyword else ''}...")
        jobs = []
        
        try:
            url = "https://www.bestjobs.ro/locuri-de-munca"
            if keyword:
                url += f"?q={keyword}"
            
            response = self.session.get(url, timeout=15)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            job_cards = soup.find_all(['div', 'li'], class_=['job-item', 'job-listing'])[:30]
            
            for card in job_cards:
                try:
                    title = card.find(['h2', 'h3', 'a'])
                    company = card.find(class_=['company', 'employer'])
                    location = card.find(class_='location')
                    
                    if title:
                        jobs.append({
                            'company': company.get_text(strip=True) if company else 'N/A',
                            'title': title.get_text(strip=True),
                            'location': location.get_text(strip=True) if location else 'Romania',
                            'req_id': 'N/A',
                            'category': 'IT' if keyword else 'Various',
                            'job_type': 'N/A',
                            'is_remote': 'N/A',
                            'apply_link': 'https://www.bestjobs.ro/',
                            'posted_date': 'N/A',
                            'source': 'BestJobs'
                        })
                except:
                    continue
                    
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        print(f"   ✅ Found {len(jobs)} jobs")
        return jobs
    
    def scrape_keysight_romania(self) -> List[Dict]:
        """Extrage joburi Keysight - API rapid"""
        print("🔍 Keysight Romania...")
        jobs = []
        
        try:
            html_url = "https://jobs.keysight.com/external/jobs?location=Romania&limit=100"
            response = self.session.get(html_url, timeout=15)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            scripts = soup.find_all('script', type='application/ld+json')
            for script in scripts:
                try:
                    data = json.loads(script.string)
                    if isinstance(data, dict) and 'jobLocation' in data:
                        jobs.append({
                            'company': 'Keysight',
                            'title': data.get('title', 'N/A'),
                            'location': data.get('jobLocation', {}).get('address', {}).get('addressLocality', 'Romania'),
                            'req_id': data.get('identifier', {}).get('value', 'N/A'),
                            'category': data.get('industry', 'N/A'),
                            'job_type': data.get('employmentType', 'N/A'),
                            'is_remote': 'Yes' if 'remote' in str(data).lower() else 'No',
                            'apply_link': data.get('url', 'N/A'),
                            'posted_date': data.get('datePosted', 'N/A'),
                            'source': 'Keysight'
                        })
                except:
                    continue
                    
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        print(f"   ✅ Found {len(jobs)} jobs")
        return jobs
    
    def scrape_amazon_romania(self) -> List[Dict]:
        """Extrage joburi Amazon România"""
        print("🔍 Amazon Romania...")
        jobs = []
        
        try:
            api_url = "https://www.amazon.jobs/en/search.json"
            params = {
                'country': 'ROU',
                'result_limit': 100,
                'sort': 'recent'
            }
            
            response = self.session.get(api_url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                job_list = data.get('jobs', [])
                
                for job in job_list:
                    jobs.append({
                        'company': 'Amazon',
                        'title': job.get('title', 'N/A'),
                        'location': f"{job.get('city', '')}, Romania",
                        'req_id': job.get('id_icims', 'N/A'),
                        'category': job.get('job_category', 'N/A'),
                        'job_type': job.get('job_schedule_type', 'N/A'),
                        'is_remote': 'Yes' if job.get('is_remote') else 'No',
                        'apply_link': f"https://www.amazon.jobs{job.get('job_path', '')}",
                        'posted_date': job.get('posted_date', 'N/A'),
                        'source': 'Amazon'
                    })
                    
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        print(f"   ✅ Found {len(jobs)} jobs")
        return jobs
    
    def scrape_all_parallel(self, sources: List[str] = None, keyword: str = "") -> List[Dict]:
        """Extrage joburi de la toate sursele în paralel"""
        
        scrapers = {
            'ejobs': lambda: self.scrape_ejobs_romania(keyword),
            'bestjobs': lambda: self.scrape_bestjobs_romania(keyword),
            'keysight': self.scrape_keysight_romania,
            'amazon': self.scrape_amazon_romania,
        }
        
        if sources is None:
            sources = list(scrapers.keys())
        
        all_jobs = []
        
        print(f"\n🚀 Scraping {len(sources)} sources in parallel...\n")
        print("="*80)
        
        with ThreadPoolExecutor(max_workers=6) as executor:
            future_to_source = {
                executor.submit(scrapers[source]): source 
                for source in sources if source in scrapers
            }
            
            for future in as_completed(future_to_source):
                source = future_to_source[future]
                try:
                    jobs = future.result()
                    all_jobs.extend(jobs)
                except Exception as e:
                    print(f"❌ {source}: {e}")
        
        print("="*80)
        print(f"\n✅ Total jobs from all sources: {len(all_jobs)}\n")
        
        return all_jobs
    
    def save_results(self, jobs: List[Dict], filename: str = "romania_jobs"):
        """Salvează rezultatele"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # JSON
        json_file = f"{filename}_{timestamp}.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(jobs, f, indent=2, ensure_ascii=False)
        print(f"💾 JSON: {json_file}")
        
        # HTML
        html_file = f"{filename}_{timestamp}.html"
        html_content = self.generate_html(jobs)
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(html_content)
        print(f"💾 HTML: {html_file}")
        
        # Statistics
        self.print_statistics(jobs)
        
        return json_file, html_file
    
    def generate_html(self, jobs: List[Dict]) -> str:
        """Generează HTML cu joburi"""
        
        # Stats
        sources = {}
        companies = {}
        for job in jobs:
            src = job.get('source', 'Unknown')
            comp = job.get('company', 'Unknown')
            sources[src] = sources.get(src, 0) + 1
            companies[comp] = companies.get(comp, 0) + 1
        
        html = f"""<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tech Jobs Romania - {len(jobs)} Positions</title>
    <style>
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }}
        .container {{ max-width: 1400px; margin: 0 auto; }}
        h1 {{
            color: white;
            text-align: center;
            margin-bottom: 30px;
            font-size: 2.5em;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }}
        .stats {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }}
        .stat-card {{
            background: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }}
        .stat-number {{
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }}
        .stat-label {{
            color: #666;
            margin-top: 5px;
            font-size: 0.9em;
        }}
        .filters {{
            background: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }}
        .filter-row {{
            display: grid;
            grid-template-columns: 2fr 1fr 1fr;
            gap: 15px;
        }}
        .filter-group label {{
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #333;
        }}
        .filter-group input, .filter-group select {{
            width: 100%;
            padding: 10px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 14px;
        }}
        .jobs-grid {{
            display: grid;
            gap: 15px;
        }}
        .job {{
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: all 0.2s;
        }}
        .job:hover {{
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        }}
        .job-header {{
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 15px;
            gap: 15px;
        }}
        .job-title {{
            font-size: 1.3em;
            font-weight: bold;
            color: #333;
            flex: 1;
        }}
        .company-badge {{
            background: #667eea;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            white-space: nowrap;
        }}
        .source-badge {{
            background: #28a745;
            color: white;
            padding: 3px 10px;
            border-radius: 15px;
            font-size: 0.8em;
            margin-top: 5px;
            display: inline-block;
        }}
        .job-details {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
            margin-bottom: 15px;
        }}
        .job-detail {{
            padding: 8px;
            background: #f8f9fa;
            border-radius: 5px;
            font-size: 0.9em;
        }}
        .job-detail strong {{
            color: #333;
            display: block;
            margin-bottom: 3px;
        }}
        .btn {{
            display: inline-block;
            padding: 10px 20px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            transition: all 0.2s;
        }}
        .btn:hover {{
            background: #5568d3;
        }}
        @media (max-width: 768px) {{
            .filter-row {{
                grid-template-columns: 1fr;
            }}
            .job-header {{
                flex-direction: column;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🇷🇴 Tech Jobs in Romania</h1>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">{len(jobs)}</div>
                <div class="stat-label">Total Jobs</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">{len(sources)}</div>
                <div class="stat-label">Job Sources</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">{len(companies)}</div>
                <div class="stat-label">Companies</div>
            </div>
        </div>
        
        <div class="filters">
            <div class="filter-row">
                <div class="filter-group">
                    <label>🔍 Search:</label>
                    <input type="text" id="searchInput" placeholder="Search by title, company, location..." onkeyup="filterJobs()">
                </div>
                <div class="filter-group">
                    <label>🏢 Company:</label>
                    <select id="companyFilter" onchange="filterJobs()">
                        <option value="">All Companies</option>
"""
        
        for company in sorted(companies.keys()):
            html += f'                        <option value="{company}">{company} ({companies[company]})</option>\n'
        
        html += """                    </select>
                </div>
                <div class="filter-group">
                    <label>📊 Source:</label>
                    <select id="sourceFilter" onchange="filterJobs()">
                        <option value="">All Sources</option>
"""
        
        for source in sorted(sources.keys()):
            html += f'                        <option value="{source}">{source} ({sources[source]})</option>\n'
        
        html += """                    </select>
                </div>
            </div>
        </div>
        
        <div class="jobs-grid" id="jobsContainer">
"""
        
        for job in jobs:
            html += f"""
            <div class="job" data-title="{job['title'].lower()}" data-company="{job['company']}" 
                 data-source="{job.get('source', '')}" data-location="{job['location'].lower()}">
                <div class="job-header">
                    <div>
                        <div class="job-title">{job['title']}</div>
                        <span class="source-badge">{job.get('source', 'Unknown')}</span>
                    </div>
                    <div class="company-badge">{job['company']}</div>
                </div>
                
                <div class="job-details">
                    <div class="job-detail">
                        <strong>📍 Location:</strong>
                        <span>{job['location']}</span>
                    </div>
                    <div class="job-detail">
                        <strong>📂 Category:</strong>
                        <span>{job['category']}</span>
                    </div>
                    <div class="job-detail">
                        <strong>💼 Type:</strong>
                        <span>{job['job_type']}</span>
                    </div>
                    <div class="job-detail">
                        <strong>🏠 Remote:</strong>
                        <span>{job['is_remote']}</span>
                    </div>
                </div>
                
                <a href="{job['apply_link']}" target="_blank" class="btn">✉️ Apply Now</a>
            </div>
"""
        
        html += """
        </div>
    </div>
    
    <script>
        function filterJobs() {
            const searchInput = document.getElementById('searchInput').value.toLowerCase();
            const companyFilter = document.getElementById('companyFilter').value;
            const sourceFilter = document.getElementById('sourceFilter').value;
            const jobs = document.querySelectorAll('.job');
            
            jobs.forEach(job => {
                const title = job.getAttribute('data-title');
                const company = job.getAttribute('data-company');
                const source = job.getAttribute('data-source');
                const location = job.getAttribute('data-location');
                
                const matchesSearch = title.includes(searchInput) || location.includes(searchInput) || company.toLowerCase().includes(searchInput);
                const matchesCompany = !companyFilter || company === companyFilter;
                const matchesSource = !sourceFilter || source === sourceFilter;
                
                if (matchesSearch && matchesCompany && matchesSource) {
                    job.style.display = '';
                } else {
                    job.style.display = 'none';
                }
            });
        }
    </script>
</body>
</html>
"""
        return html
    
    def print_statistics(self, jobs: List[Dict]):
        """Afișează statistici"""
        print("\n" + "="*80)
        print("📊 STATISTICS")
        print("="*80)
        
        # By source
        sources = {}
        for job in jobs:
            src = job.get('source', 'Unknown')
            sources[src] = sources.get(src, 0) + 1
        
        print(f"\n📊 Jobs by Source:")
        for source, count in sorted(sources.items(), key=lambda x: x[1], reverse=True):
            print(f"   • {source}: {count}")
        
        # By company (top 10)
        companies = {}
        for job in jobs:
            comp = job['company']
            companies[comp] = companies.get(comp, 0) + 1
        
        print(f"\n🏢 Top Companies:")
        for company, count in sorted(companies.items(), key=lambda x: x[1], reverse=True)[:10]:
            print(f"   • {company}: {count}")
        
        print("\n" + "="*80)


def main():
    print("\n" + "="*80)
    print("🇷🇴 ROMANIA JOBS SCRAPER V2")
    print("="*80 + "\n")
    
    scraper = RomaniaJobScraper()
    
    print("📋 Available Sources:\n")
    print("   1. eJobs Romania")
    print("   2. BestJobs Romania")
    print("   3. Keysight Technologies")
    print("   4. Amazon Romania")
    print("\n   ALL - All sources")
    
    keyword = input("\n🔑 Search keyword (optional, e.g., 'python', 'java'): ").strip()
    selection = input("👉 Your selection (1-4, ALL, or Enter for all): ").strip().lower()
    
    sources_map = {
        '1': ['ejobs'],
        '2': ['bestjobs'],
        '3': ['keysight'],
        '4': ['amazon'],
        'all': None,
        '': None
    }
    
    sources = sources_map.get(selection, None)
    
    print(f"\n✅ Scraping {f'with keyword: {keyword}' if keyword else 'all jobs'}...")
    
    start_time = time.time()
    jobs = scraper.scrape_all_parallel(sources, keyword)
    elapsed = time.time() - start_time
    
    if jobs:
        json_file, html_file = scraper.save_results(jobs)
        
        print(f"\n⏱️  Total time: {elapsed:.2f} seconds")
        print(f"⚡ Speed: {len(jobs)/elapsed:.1f} jobs/second")
        print(f"\n💡 Open {html_file} in your browser!\n")
    else:
        print("\n❌ No jobs found!\n")


if __name__ == "__main__":
    main()
