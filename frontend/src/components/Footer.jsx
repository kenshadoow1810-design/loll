function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm">
            © 2025 LoL Pro Stats. Dados fornecidos pela Riot Games API.
          </div>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <span className="text-gray-500 text-sm">
              Desenvolvido com ❤️ para a comunidade de LoL
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
