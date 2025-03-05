namespace M79Climbing.Models.PMS
{
    /*
        typedef struct tagPMS_VECTOR {
           float x;
           float y;
           float z;
        } PMS_VECTOR;
    */

    public class PMS_VECTOR
    {
        public float X { get; set; } 
        public float Y { get; set; } 
        public float Z { get; set; } 

        public PMS_VECTOR(BinaryReader br)
        {
            this.X = br.ReadSingle();  
            this.Y = br.ReadSingle();  
            this.Z = br.ReadSingle();
        }
    }
}
