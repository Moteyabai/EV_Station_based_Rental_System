using BusinessObject.Models;
using BusinessObject.Models.PayOS;
using Microsoft.Extensions.Configuration;
using Net.payOS;
using Net.payOS.Types;
using Repositories;
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

        public PaymentService(IConfiguration configuration)
        {
            _paymentRepository = PaymentRepository.Instance;
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

        public async Task<string> CreatePaymentLink(CreatePaymentLinkRequest body)
        {
            List<ItemData> items = new List<ItemData>();

            string canceledUrl = $"{_client}/payment-callback?code=01&status=CANCELLED&cancel=true&orderCode={body.paymentID}";
            string successUrl = $"{_client}/payment-callback?code=00&status=PAID&cancel=false&orderCode={body.paymentID}";
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
    }
}