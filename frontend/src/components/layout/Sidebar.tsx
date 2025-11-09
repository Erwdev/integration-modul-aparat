interface SidebarProps {
  activeMenu?: 'aparat' | 'ekspedisi' | 'surat';
}

const Sidebar = ({ activeMenu = 'aparat' }: SidebarProps) => {
  return (
    <aside className="w-64 bg-white shadow-md px-4 py-6">
      <h1 className="text-2xl font-bold text-blue-600 mb-8">SIAP</h1>
      <nav className="space-y-2">
        <p className="text-gray-400 uppercase text-xs">Data Management</p>
        <ul className="space-y-2">
          <li className={`${activeMenu === 'aparat' ? 'text-blue-600 font-semibold bg-blue-50' : 'text-gray-600 hover:text-blue-500'} px-2 py-1 rounded-md cursor-pointer`}>
            Aparat
          </li>
          <li className={`${activeMenu === 'ekspedisi' ? 'text-blue-600 font-semibold bg-blue-50' : 'text-gray-600 hover:text-blue-500'} px-2 py-1 rounded-md cursor-pointer`}>
            
          </li>
          <li className={`${activeMenu === 'surat' ? 'text-blue-600 font-semibold bg-blue-50' : 'text-gray-600 hover:text-blue-500'} px-2 py-1 rounded-md cursor-pointer`}>
            
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;