namespace M79Climbing.Models.PMS
{
    /*
        typedef struct tagPMS_COLOR {
	       UBYTE blue;
	       UBYTE green;
	       UBYTE red;
	       UBYTE alpha;
        } PMS_COLOR;
    */

    public class PMS_COLOR
    {
        byte blue;
        byte green;
        byte red;
        byte alpha;

        public PMS_COLOR(BinaryReader br)
        {
            blue = br.ReadByte();
            green = br.ReadByte();
            red = br.ReadByte();
            alpha = br.ReadByte();
        }
    }
}
