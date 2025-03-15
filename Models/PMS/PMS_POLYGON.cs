namespace M79Climbing.Models.PMS
{
    /*
        typedef struct tagPMS_POLYGON {
        	PMS_VERTEX vetex[3];
        	PMS_VECTOR perpendicular[3];
        	PMS_POLYTYPE polyType;
        } PMS_POLYGON;
    */

    public class PMS_POLYGON
    {
        public PMS_VERTEX[] vertexes;
        public PMS_VECTOR[] perpendicular;
        public enum PMS_POLYTYPE : byte
        {
            ptNORMAL = 0,
            ptONLY_BULLETS_COLLIDE,
            ptONLY_PLAYERS_COLLIDE,
            ptNO_COLLIDE,
            ptICE,
            ptDEADLY,
            ptBLOODY_DEADLY,
            ptHURTS,
            ptREGENERATES,
            ptLAVA,
            ptALPHABULLETS,
            ptALPHAPLAYERS,
            ptBRAVOBULLETS,
            ptBRAVOPLAYERS,
            ptCHARLIEBULLETS,
            ptCHARLIEPLAYERS,
            ptDELTABULLETS,
            ptDELTAPLAYERS,
            ptBOUNCY,
            ptEXPLOSIVE,
            ptHURTFLAGGERS,
            ptFLAGGERCOLLIDES,
            ptNONFLAGGERCOLLIDES,
            ptFLAGCOLLIDES
        }

        public PMS_POLYTYPE polyType;

        public PMS_POLYGON(BinaryReader br)
        {
            this.vertexes = new PMS_VERTEX[3];
            this.perpendicular = new PMS_VECTOR[3];

            for (int i = 0; i < 3; i++)
            {
                this.vertexes[i] = new PMS_VERTEX(br);
            }

            for (int i = 0; i < 3; i++)
            {
                this.perpendicular[i] = new PMS_VECTOR(br);

            }

            this.polyType = (PMS_POLYTYPE)br.ReadByte();
        }
    }
}
