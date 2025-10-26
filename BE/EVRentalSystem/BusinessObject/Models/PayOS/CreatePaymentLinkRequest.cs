namespace BusinessObject.Models.PayOS
{
    public record CreatePaymentLinkRequest(
    long paymentID,
    string description,
    int price,
    string buyerName,
    string buyerEmail,
    int expriedAt
    );
}