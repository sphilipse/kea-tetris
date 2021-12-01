import { Color } from "../shared/tetris.interfaces";
import './block.scss';

export const Block = ({ color }: { color: Color}) => (<div className={color}></div>)
