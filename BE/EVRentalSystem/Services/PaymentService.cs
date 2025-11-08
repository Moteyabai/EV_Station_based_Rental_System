using BusinessObject.Models;
using BusinessObject.Models.PayOS;
using Microsoft.Extensions.Configuration;
using Net.payOS;
using Net.payOS.Types;
using Repositories;
using Repositories.DBContext;
using Services.Interfaces;

namespace Services
{
    public class PaymentService : IBaseService<Payment>
    {
        private readonly PaymentRepository _paymentRepository;
        private readonly IConfiguration _configuration;
        private readonly string _client;
        private readonly string _server;
        private readonly PayOS _payOS;

        // ✅ NEW: Constructor for Dependency Injection (RECOMMENDED)
        public PaymentService(EVRenterDBContext context, IConfiguration configuration)
        {
            _paymentRepository = new PaymentRepository(context);
            _configuration = configuration;
            PayOSSettings payOS = new PayOSSettings()
            {
                ClientId = _configuration.GetValue<string>("PayOS:PAYOS_CLIENT_ID"),
                ApiKey = _configuration.GetValue<string>("PayOS:PAYOS_API_KEY"),
                ChecksumKey = _configuration.GetValue<string>("PayOS:PAYOS_CHECKSUM_KEY")
            };
            _client = _configuration["Client"];
            _server = _configuration["Server"];
            _payOS = new PayOS(payOS.ClientId, payOS.ApiKey, payOS.ChecksumKey);
        }

        public async Task AddAsync(Payment entity) => await _paymentRepository.AddAsync(entity);

        public async Task DeleteAsync(int id) => await _paymentRepository.DeleteAsync(id);

        public async Task<IEnumerable<Payment>> GetAllAsync() => await _paymentRepository.GetAllAsync();

        public async Task<Payment> GetByIdAsync(int id) => await _paymentRepository.GetByIdAsync(id);

        public async Task UpdateAsync(Payment entity) => await _paymentRepository.UpdateAsync(entity);

        public async Task<Payment> GetPaymentByIDAsync(long ID) => await _paymentRepository.GetPaymentByIDAsync(ID);

        public async Task<string> CreatePaymentLink(CreatePaymentLinkRequest body)
        {
            List<ItemData> items = new List<ItemData>();

            string canceledUrl = "";
            string successUrl = "";

            if (body.isFee)
            {
                canceledUrl = $"{_server}/api/Payment/fee-failed?orderCode={body.paymentID}";
                successUrl = $"{_server}/api/Payment/fee-success?orderCode={body.paymentID}";
            }
            else
            {
                canceledUrl = $"{_client}/payment-callback?code=01&status=CANCELLED&cancel=true&orderCode={body.paymentID}";
                successUrl = $"{_client}/payment-callback?code=00&status=PAID&cancel=false&orderCode={body.paymentID}";
            }
            PaymentData paymentData = new PaymentData(
                body.paymentID,
                body.price,
                body.description,
                items,
                canceledUrl,
                successUrl,
                null,
                body.buyerName,
                body.buyerEmail,
                null,
                null,
                body.expriedAt
            );

            CreatePaymentResult createPayment = await _payOS.createPaymentLink(paymentData);
            if (createPayment == null || string.IsNullOrEmpty(createPayment.checkoutUrl))
            {
                throw new Exception("Tạo link thanh toán thất bại!");
            }

            return createPayment.checkoutUrl;
        }

        public async Task<IEnumerable<Payment>> GetPendingPayment() => await _paymentRepository.GetPendingPayment();
    }
}