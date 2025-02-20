namespace M79Climbing.Helpers
{
    public static class TimeHelper
    {
        // Returns the timer in the format "Minutes:Seconds:Milliseconds" 
        public static string ReturnTime(int ticks)
        {
            // 1 tick = 1.66 milliseconds
            int totalMilliseconds = (int)(ticks * (1000 / 60));

            // Calculate minutes, seconds, and milliseconds
            int minutes = (int)(totalMilliseconds / 60000);
            int seconds = (int)((totalMilliseconds % 60000) / 1000);
            int milliseconds = (int)(totalMilliseconds % 1000);

            // Format the output as "MM:SS:MS" with leading zeros
            return $"{minutes:D2}:{seconds:D2}:{milliseconds:D3}";
        }
    }
}