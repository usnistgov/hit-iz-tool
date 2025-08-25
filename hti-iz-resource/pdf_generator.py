import os
import sys
import subprocess

def gen_pdf(html_filename, pdf_filename):
    process = subprocess.Popen(['wkhtmltopdf', html_filename, pdf_filename],
                               stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    for line in process.stdout:
        print(line.strip())

def gen_toc_pdf(html_filename, pdf_filename):
    process = subprocess.Popen(['wkhtmltopdf', 'toc', html_filename, pdf_filename],
                               stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    for line in process.stdout:
        print(line.strip())

def gen_cover_page_pdf(html_filename, pdf_filename, coverpage_filename):
    process = subprocess.Popen(['wkhtmltopdf', 'cover', coverpage_filename, 'toc', html_filename, pdf_filename],
                               stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    for line in process.stdout:
        print(line.strip())

def process_dir(source):
    for root, dirs, files in os.walk(source):
        for file in files:
            if file.endswith('.html'):
                filepath = os.path.join(root, file)
                if file == 'TestStory.html':
                    continue  # Do nothing
                elif file == 'TestStoryPDF.html':
                    pdf_filename = filepath.replace('PDF.html', '.pdf')
                    gen_pdf(filepath, pdf_filename)
                    os.remove(filepath)
                elif file == 'MessageContentPDF.html':
                    pdf_filename = filepath.replace('PDF.html', '.pdf')
                    gen_pdf(filepath, pdf_filename)
                    os.remove(filepath)
                elif file == 'TestDataSpecificationPDF.html':
                    pdf_filename = filepath.replace('PDF.html', '.pdf')
                    gen_pdf(filepath, pdf_filename)
                    os.remove(filepath)
                elif file == 'TestPackage.html':
                    pdf_filename = filepath.replace('.html', '.pdf')
                    coverpage_filename = filepath.replace('TestPackage.html', 'CoverPage.html')
                    gen_cover_page_pdf(filepath, pdf_filename, coverpage_filename)
                else:
                    pdf_filename = filepath.replace('.html', '.pdf')
                    gen_pdf(filepath, pdf_filename)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 pdf_generator.py <test_plan_directory>")
        sys.exit(1)
    test_plan_directory = sys.argv[1]
    if not os.path.isdir(test_plan_directory):
        print(f"Error: Directory '{test_plan_directory}' does not exist.")
        sys.exit(1)
    process_dir(test_plan_directory)
