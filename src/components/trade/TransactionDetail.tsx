interface TransactionSummaryProps {
  transaction: {
    id: number;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    price: number;
    createdAt: string;
    patentTitle: string;
    categoryName: string;
    sellerEmail: string;
    buyerEmail: string;
  };
  onClose: () => void;
}

const statusLabelMap = {
  PENDING: '대기중',
  IN_PROGRESS: '진행중',
  COMPLETED: '완료',
  CANCELLED: '취소',
};

const statusColorMap = {
  COMPLETED: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function TransactionSummary({ transaction, onClose }: TransactionSummaryProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('ko-KR').format(price);

  const formatDate = (date: string) =>
    new Date(date).toLocaleString('ko-KR');

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">거래 상세 내역</h2>

      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span>거래 ID: #{transaction.id}</span>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColorMap[transaction.status]}`}>
            {statusLabelMap[transaction.status]}
          </span>
        </div>
        <p className="text-purple-700 font-bold text-xl mb-1">₩{formatPrice(transaction.price)}</p>
        <p className="text-gray-600 text-sm">거래 일시: {formatDate(transaction.createdAt)}</p>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 mb-4 text-sm">
        <p><strong>제목:</strong> {transaction.patentTitle}</p>
        <p><strong>카테고리:</strong> {transaction.categoryName}</p>
      </div>

      <div className="bg-green-50 rounded-lg p-4 mb-6 text-sm grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-500">판매자:</p>
          <p className="font-medium">{transaction.sellerEmail}</p>
        </div>
        <div>
          <p className="text-gray-500">구매자:</p>
          <p className="font-medium">{transaction.buyerEmail}</p>
        </div>
      </div>

      <div className="text-right">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
