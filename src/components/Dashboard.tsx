import React, { useState, useMemo } from 'react';
import { Search, X, Plus } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ChartItem {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface WidgetData {
  total: number;
  items: ChartItem[];
}

interface Widget {
  id: string;
  title: string;
  text: string;
  type?: 'donut' | 'progress' | 'empty' | 'text';
  data?: WidgetData;
}

interface Category {
  id: string;
  name: string;
  widgets: Widget[];
}

interface DashboardData {
  categories: Category[];
}

const initialData: DashboardData = {
  categories: [
    {
      id: 'cspm',
      name: 'CSPM Executive Dashboard',
      widgets: [
        { 
          id: 'w1', 
          title: 'Cloud Accounts', 
          text: '2 Total',
          type: 'donut',
          data: {
            total: 2,
            items: [
              { name: 'Connected', value: 2, color: '#3B82F6' },
              { name: 'Not Connected', value: 0, color: '#E5E7EB' }
            ]
          }
        },
        { 
          id: 'w2', 
          title: 'Cloud Account Risk Assessment', 
          text: '9659 Total',
          type: 'donut',
          data: {
            total: 9659,
            items: [
              { name: 'Failed', value: 1689, color: '#EF4444' },
              { name: 'Warning', value: 681, color: '#F59E0B' },
              { name: 'Not available', value: 36, color: '#6B7280' },
              { name: 'Passed', value: 7253, color: '#10B981' }
            ]
          }
        }
      ]
    },
    {
      id: 'cwpp',
      name: 'CWPP Dashboard',
      widgets: [
        { id: 'w4', title: 'Top 5 Namespace Specific Alerts', text: 'No Graph data available!', type: 'empty' },
        { id: 'w5', title: 'Workload Alerts', text: 'No Graph data available!', type: 'empty' }
      ]
    },
    {
      id: 'registry',
      name: 'Registry Scan',
      widgets: [
        { 
          id: 'w7', 
          title: 'Image Risk Assessment', 
          text: '1470 Total Vulnerabilities',
          type: 'progress',
          data: {
            total: 1470,
            items: [
              { name: 'Critical', value: 9, color: '#7C2D12' },
              { name: 'High', value: 150, color: '#DC2626' }
            ]
          }
        },
        { 
          id: 'w8', 
          title: 'Image Security Issues', 
          text: '2 Total Images',
          type: 'progress',
          data: {
            total: 2,
            items: [
              { name: 'Critical', value: 2, color: '#7C2D12' },
              { name: 'High', value: 2, color: '#DC2626' }
            ]
          }
        }
      ]
    }
  ]
};

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData>(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hiddenWidgets, setHiddenWidgets] = useState<Set<string>>(new Set());
  const [selectedTab, setSelectedTab] = useState('CSPM');

  // Get all widgets for the modal checklist
  const allWidgets = useMemo(() => {
    return data.categories.flatMap(category => 
      category.widgets.map(widget => ({ ...widget, categoryId: category.id, categoryName: category.name }))
    );
  }, [data]);

  // Filter widgets based on search term and visibility
  const filteredData = useMemo(() => {
    return {
      categories: data.categories.map(category => ({
        ...category,
        widgets: category.widgets.filter(widget => 
          !hiddenWidgets.has(widget.id) &&
          (searchTerm === '' || widget.title.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      })).filter(category => category.widgets.length > 0)
    };
  }, [data, searchTerm, hiddenWidgets]);

  const handleRemoveWidget = (categoryId: string, widgetId: string) => {
    setData(prev => ({
      categories: prev.categories.map(category => 
        category.id === categoryId 
          ? { ...category, widgets: category.widgets.filter(w => w.id !== widgetId) }
          : category
      )
    }));
  };

  // Removed unused handleAddWidget after sidebar removal and UI simplification

  const handleWidgetVisibility = (widgetId: string, isVisible: boolean) => {
    setHiddenWidgets(prev => {
      const newSet = new Set(prev);
      if (isVisible) {
        newSet.delete(widgetId);
      } else {
        newSet.add(widgetId);
      }
      return newSet;
    });
  };

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Home</span>
              <span className="text-sm text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-900">Dashboard V2</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Widget +
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">🕐 Last 2 days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Dashboard Content */}
        <div className="flex-1 p-6">
          {filteredData.categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No widgets found matching your search.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredData.categories.map(category => (
                <CategorySection
                  key={category.id}
                  category={category}
                  onRemoveWidget={handleRemoveWidget}
                  onOpenAddWidget={() => setIsModalOpen(true)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Widget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="fixed right-0 top-0 h-full w-1/2 bg-white shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-medium">Add Widget</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 h-full overflow-y-auto">
              <p className="text-gray-600 mb-6">Personalise your dashboard by adding the following widget</p>

              {/* Category Tabs */}
              <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
                {['CSPM', 'CWPP', 'Image', 'Ticket'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      selectedTab === tab 
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Widget List */}
              <div className="space-y-3 mb-8 max-h-96 overflow-y-auto">
                {allWidgets
                  .filter(widget => {
                    if (selectedTab === 'CSPM') return widget.categoryId === 'cspm';
                    if (selectedTab === 'CWPP') return widget.categoryId === 'cwpp';
                    if (selectedTab === 'Image') return widget.categoryId === 'registry';
                    return widget.categoryId === 'registry';
                  })
                  .map(widget => (
                    <div key={widget.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md bg-gray-50">
                      <input
                        type="checkbox"
                        checked={!hiddenWidgets.has(widget.id)}
                        onChange={(e) => handleWidgetVisibility(widget.id, e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-900 font-medium">{widget.title}</span>
                    </div>
                  ))}
              </div>

              {/* Modal Footer */}
              <div className="absolute bottom-0 right-0 left-0 bg-white border-t border-gray-200 p-6 flex justify-end space-x-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-900 rounded-md hover:bg-blue-800 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface CategorySectionProps {
  category: Category;
  onRemoveWidget: (categoryId: string, widgetId: string) => void;
  onOpenAddWidget: () => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({ category, onRemoveWidget, onOpenAddWidget }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{category.name}</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {category.widgets.map(widget => (
          <WidgetCard
            key={widget.id}
            widget={widget}
            onRemove={() => onRemoveWidget(category.id, widget.id)}
          />
        ))}
        {/* Add Widget Placeholder */}
        <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6 flex items-center justify-center min-h-[200px] hover:border-gray-400 transition-colors">
          <button 
            onClick={onOpenAddWidget}
            className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm font-medium">Add Widget</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface WidgetCardProps {
  widget: Widget;
  onRemove: () => void;
}

const WidgetCard: React.FC<WidgetCardProps> = ({ widget, onRemove }) => {
  const renderWidgetContent = () => {
    switch (widget.type) {
      case 'donut':
       return widget.data ? <DonutChart data={widget.data} /> : null;
      case 'progress':
       return widget.data ? <ProgressChart data={widget.data} /> : null;
      case 'empty':
        return <EmptyChart />;
      default:
        return (
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {widget.text.match(/\d+/) ? widget.text.match(/\d+/)?.[0] : '0'}
            </div>
            <p className="text-xs text-gray-500">{widget.text}</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 min-h-[280px] hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900 flex-1 pr-2">{widget.title}</h3>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500 transition-colors duration-200 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Widget Content Area */}
      <div className="h-48">{renderWidgetContent()}</div>
    </div>
  );
};
// Chart Components
const DonutChart: React.FC<{ data: WidgetData }> = ({ data }) => {
  return (
    <div className="h-full flex items-center">
      <div className="w-1/2">
        <ResponsiveContainer width="100%" height={120}>
          <PieChart>
            <Pie
              data={data.items}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={50}
              paddingAngle={2}
              dataKey="value"
            >
              {data.items.map((entry: ChartItem, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="text-center mt-2">
          <div className="text-lg font-bold text-gray-900">{data.total}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
      </div>
      <div className="w-1/2 pl-4">
        <div className="space-y-2">
         {data.items.map((item: ChartItem, index: number) => (
            <div key={index} className="flex items-center text-xs">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-gray-700">{item.name} ({item.value})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProgressChart: React.FC<{ data: WidgetData }> = ({ data }) => {
  return (
    <div className="h-full flex flex-col justify-center">
      <div className="mb-4">
        <div className="text-lg font-bold text-gray-900">{data.total}</div>
        <div className="text-xs text-gray-500">Total Vulnerabilities</div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="flex h-2 rounded-full overflow-hidden">
            {data.items.map((item: ChartItem, index: number) => {
              const percentage = (item.value / data.total) * 100;
              return (
                <div
                  key={index}
                  className="h-full"
                  style={{ 
                    backgroundColor: item.color, 
                    width: `${percentage}%` 
                  }}
                ></div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex space-x-4">
        {data.items.map((item: ChartItem, index: number) => (
          <div key={index} className="flex items-center text-xs">
            <div 
              className="w-3 h-3 rounded-full mr-1" 
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="text-gray-700">{item.name} ({item.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const EmptyChart: React.FC = () => {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center text-gray-400">
        <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-sm">No Graph data available!</p>
      </div>
    </div>
  );
};

export default Dashboard;