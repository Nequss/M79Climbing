namespace M79Climbing.Models.PMS
{
    /*
        typedef struct tagPMS_VERTEX {
           float x;
           float y;
           float z;
           float rhw;
           PMS_COLOR color;
           float tu;
           float tv;
        } PMS_VERTEX;
    */

    public class PMS_VERTEX
    {
        public float X { get; set; }    
        public float Y { get; set; }    
        public float Z { get; set; }    
        public float RHW { get; set; }  
        public PMS_COLOR Color { get; set; }  
        public float TU { get; set; }  
        public float TV { get; set; }

        public PMS_VERTEX(BinaryReader br)
        {
            this.X = br.ReadSingle();
            this.Y = br.ReadSingle();
            this.Z = br.ReadSingle();
            this.RHW = br.ReadSingle();
            this.Color = new PMS_COLOR(br);
            this.TU = br.ReadSingle();
            this.TV = br.ReadSingle();
        }
    }
}
