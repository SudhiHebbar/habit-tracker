namespace HabitTracker.Infrastructure.Extensions
{
    public static class DateTimeExtensions
    {
        public static DateTime ToDateTime(this DateOnly date)
        {
            return date.ToDateTime(TimeOnly.MinValue);
        }

        public static DateTime ToDateTimeWithTime(this DateOnly date, TimeOnly time)
        {
            return date.ToDateTime(time);
        }
    }
}